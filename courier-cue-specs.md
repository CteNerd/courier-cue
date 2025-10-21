# CourierCue – Multi‑Tenant SaaS POC Specification (Envs: **dev** & **prod**)

> **Purpose**  
> Digitize AAA Pallet–style pick‑up/delivery slips and driver workflow as a **multi‑tenant SaaS** for loading companies. Day‑one focus: low cost, small surface area, clear docs, and automated deploys. Environments: **dev** (internal testing) and **prod** (customer‑facing).

---

## 1) Product Overview

### 1.1 Personas & Roles
- **Platform Admin** (CourierCue staff): create/suspend orgs, view usage, basic support tools.
- **Org Admin** (company owner/ops): configure org settings, invite/manage users, query all load history, exports.
- **Org Co‑Admin**: same as Admin except org‑level settings/billing.
- **Driver**: view assigned loads, update status, capture shipper signature, add notes/photos.
- **Shipper (no login)**: signs on driver’s tablet; receives email copy of the signed receipt.

**AuthZ**: JWT claims contain `orgId` and `role`; every API enforces **row‑level** guards using `orgId` from JWT (never trust request body for tenancy decisions).

### 1.2 Core Use Cases (Happy Path)
1) **Org Admin** creates a **Load** and assigns a **Driver**.  
2) **Driver** starts job → updates to `IN_TRANSIT`.  
3) At **delivery**, **Shipper** signs on the tablet (signature canvas).  
4) System stores signature in S3, updates load to `DELIVERED`, generates PDF receipt, emails shipper & CCs accounting.  
5) **Org Admin/Co‑Admin** queries history, exports CSV/PDF.

### 1.3 Non‑Goals (POC)
- Offline/sync; third‑party billing; complex reporting; mobile native apps (tablet‑optimized web only).

---

## 2) Environments

We maintain **two** environments only:

- **dev** – internal testing and demos. SES can remain in sandbox. Buckets, tables, Cognito resources suffixed with `-dev`. Public URLs may use an S3 website endpoint or a dev subdomain (e.g., `dev.couriercue.app`).  
- **prod** – customer‑facing. SES production access (or verified sender). Resources suffixed with `-prod`. Recommended CloudFront + custom domain (optional for POC).

**Naming & Separation**
- Single AWS account is acceptable for POC; **prefer** separate AWS accounts or at least separate stacks & resource names per env.  
- CloudFormation parameter: `Env` with **AllowedValues:** `dev`, `prod`.  
- S3 buckets: `couriercue-<env>-web`, `couriercue-<env>-assets`  
- Table: `couriercue-<env>-main`  
- Cognito User Pool name: `couriercue-<env>`  
- API name: `couriercue-<env>`

**Deployment Policy**
- CI deploys `dev` automatically on merges to `main`.  
- `prod` deploys on **tagged release** (e.g., `v1.0.0`) with a manual approval step.

---

## 3) Architecture

```
React + TypeScript SPA (S3 static hosting; optional CloudFront per env)
     │
Cognito Hosted UI (User Pool) — OAuth2 Code Flow
     │  (JWT with orgId, role)
API Gateway HTTP API (JWT Authorizer)
     │
AWS Lambda (Node.js 20, TypeScript, Middy middlewares)
     │
DynamoDB (single-table design)  ───── S3 (signatures, logos, PDFs)
                                     └─ SES (email signed receipts)
```

**Observability**: CloudWatch Logs, basic metrics/alarms (5xx rate, throttles, SES bounces).  
**Cost Controls**: On‑demand DynamoDB, Lambda 128–512MB, S3 lifecycle → IA @ 30d, delete old artifacts per‑org retention.

---

## 4) Multi‑Tenancy & Security

- **Tenancy field**: `orgId` required on all entities.  
- **Row‑level guard**: Lambdas derive `orgId` from JWT; if body includes `orgId`, it’s validated to match claims.  
- **Cognito Groups**: `platformAdmin`, `admin`, `coadmin`, `driver`.  
- **S3**: bucket‑level block‑public‑access; object keys include `orgId/loadId/...`. Uploads via **presigned PUT**.  
- **Audit Trail**: immutable `LoadEvent` items for every state transition.  
- **PII**: minimal (names, emails, phone on service address).  
- **Transport**: HTTPS only.  
- **Logging**: structured JSON (`requestId`, `orgId`, `actor`, `loadId`, `action`, `statusCode`, `latency`).

---

## 5) Data Model (DynamoDB Single‑Table)

**Table**: `couriercue-<env>-main`  
**Keys**: `PK`, `SK`  
**GSIs**:
- **GSI1** – User by email (login/lookup): `GSI1PK=USER#<email>`, `GSI1SK=ORG#<orgId>`
- **GSI2** – Loads by driver+date: `GSI2PK=DRIVER#<driverId>`, `GSI2SK=<yyyy-mm-dd>#LOAD#<loadId>`
- **GSI3** – Loads by status: `GSI3PK=STATUS#<status>`, `GSI3SK=<updatedAt>#LOAD#<loadId>`
- **GSI4** – Org history (admin search): `GSI4PK=ORG#<orgId>#LOADS`, `GSI4SK=<yyyy-mm-dd>#<status>#<loadId>`

**Entities**
- **Org**  
  - `PK=ORG#<orgId>` `SK=ORG#<orgId>`  
  - `orgName, legalName, logoUrl, emailFrom, billingEmail, accountingCc[], defaultUnloadLocations[], allowedItemTypes[], signatureOptions{requireGeo,capturePrintedName}, retentionDays, features{remoteSign,pdfBranding,exports}, plan`
- **User**  
  - `PK=ORG#<orgId>` `SK=USER#<userId>`  
  - `email, displayName, role, phone, isDisabled, lastLoginAt`  
  - GSI1 for cross‑org email lookup
- **Load**  
  - `PK=ORG#<orgId>` `SK=LOAD#<loadId>`  
  - `status, createdAt, updatedAt, createdBy, assignedDriverId, serviceAddress{...}, description, items[], notes, unloadLocation, shipVia, trailer{dropped,picked,liveLoad,percentFull}, receiptPdfKey?, signatureKey?`  
  - GSI2/GSI3/GSI4 projection fields
- **LoadEvent** (audit)  
  - `PK=ORG#<orgId>#LOAD#<loadId>` `SK=EVENT#<timestamp>`  
  - `type, actorId, ip, userAgent, meta`
- **Signature**  
  - `PK=ORG#<orgId>#LOAD#<loadId>` `SK=SIGN#SHIPPER`  
  - `signerName, signedAt, geo{lat,lng,accuracy}, s3Key, sha256`

**Example Load (trimmed)**
```json
{
  "PK": "ORG#aaa",
  "SK": "LOAD#2c0d-...",
  "status": "ASSIGNED",
  "assignedDriverId": "user-123",
  "serviceAddress": {
    "name": "COLOPLAST DISTRIBUTION",
    "street": "4008 HERITAGE DRIVE",
    "city": "Brookshire",
    "state": "TX",
    "zip": "77423",
    "contact": "JAKE MORRIS",
    "phone": "832-815-1380",
    "email": "jmorris@example.com"
  },
  "items": [{"type":"USED_48x40_CORE","qty":1}],
  "unloadLocation": "YARD_1",
  "shipVia": "AAA-SWAP"
}
```

---

## 6) API (HTTP, JSON)

**Auth**: `Authorization: Bearer <Cognito JWT>`; API Gateway JWT Authorizer.  
**Request Validation**: `zod` schemas; all handlers wrapped with `middy`.

### 6.1 Org
- `GET  /org/settings` (admin, coadmin)  
- `PATCH /org/settings` (admin, coadmin) – partial updates  
- `GET  /org/users` (admin, coadmin)  
- `POST /org/users/invite` (admin) – creates Cognito user; sets custom attrs `orgId`, `role`  
- `PATCH /org/users/{userId}` (admin) – change role/disable

### 6.2 Loads
- `POST /loads` (admin, coadmin) – create draft  
- `PATCH /loads/{id}` (admin, coadmin) – edit fields/assign driver  
- `GET  /loads/{id}` (admin/coadmin/assigned driver)  
- `GET  /loads?status=&driverId=&from=&to=&q=` (admin, coadmin) – org history via GSI4 + client‑side free‑text  
- `GET  /loads/my?from=&to=` (driver) – via GSI2  
- `POST /loads/{id}/status` body `{action:"IN_TRANSIT"|"DELIVERED"}` (driver)  
- `POST /loads/{id}/signature/shipper/presign` (driver) → presigned S3 PUT  
- `POST /loads/{id}/signature/shipper/confirm` (driver) `{s3Key, signerName, lat,lng,accuracy,signedAt}`  
- `GET  /loads/{id}/receipt.pdf` – generate (cache in S3) & stream  
- `POST /loads/{id}/email` – (re)send SES receipt

### 6.3 Platform Admin
- `GET  /platform/orgs`  
- `POST /platform/orgs` – create org shell record  
- `PATCH /platform/orgs/{orgId}` – suspend/reactivate, change plan

**Sample OpenAPI fragment**
```yaml
paths:
  /loads/{id}/signature/shipper/confirm:
    post:
      security: [{ cognitoJwt: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [s3Key, signerName, signedAt]
              properties:
                s3Key: { type: string }
                signerName: { type: string }
                signedAt: { type: string, format: date-time }
                lat: { type: number }
                lng: { type: number }
                accuracy: { type: number }
      responses:
        '200': { description: OK }
```

---

## 7) Frontend (React + TS)

**Stack**: React 18 + Vite + TypeScript. UI: Tailwind CSS + Radix UI (accessible primitives).  
**State**: React Query for data fetching/cache; Zod for forms; React Hook Form.

**Key Screens**
- **Login** (Cognito Hosted UI redirect)  
- **Org Admin Portal**
  - *Dashboard*: KPIs (Today’s Loads, In‑Transit, Delivered YTD), quick filters
  - *Loads*: virtualized table, sticky filters (status/date/driver/query), row → details, **Export CSV**
  - *Users*: invite (email, role), enable/disable, change roles
  - *Settings*: logo upload (S3 presigned), email/billing contacts, unload locations, allowed item types, retention, feature toggles
- **Driver App**
  - *My Loads*: Today/Upcoming cards (destination, contact, big CTA)
  - *Load Flow*: Start → Arrived → **Signature** (full‑screen canvas) → Submit
  - *Success*: “Email sent to shipper” + view receipt

**Signature Capture**
- `react-signature-canvas` → PNG → presigned PUT.  
- HTML5 Geolocation optional; stored if consented.

**Accessibility**
- WCAG AA contrast, skip links, keyboard‑navigable dialogs, focus‑visible styles.

---

## 8) PDF Receipt & Email

- **PDF** built with `pdf-lib` (pure JS), includes:
  - Org logo/name, service address, line items, trailer/unload info
  - Shipper signature image, printed name, date/time (UTC and local), geo coords (if captured)
  - Driver name/id, disclaimer footer (from paper slip)
- **Email (SES)**  
  - Template vars: `shipperName, loadId, signedAt, driverName, orgName, linkToReceipt`  
  - Attach PDF (≤1MB) or link only (SES sandbox fallback).  
  - **dev**: allow SES sandbox; **prod**: request production access or verify customer domains.

---

## 9) Infrastructure (CloudFormation)

**Stacks/Resources**
- **Core**
  - S3: `couriercue-<env>-web` (SPA), `couriercue-<env>-assets` (signatures, logos, PDFs; lifecycle to IA @ 30d)
  - DynamoDB: single table + GSIs (GSI1–GSI4)
  - Cognito: User Pool, App Client, Domain; Groups created post‑deploy
  - API Gateway (HTTP API) + JWT authorizer
  - Lambda functions (Node.js 20) per route; optional shared layer
  - SES: verify global sender identity (POC)

- **IAM**
  - Execution roles with least‑privilege policies (DDB table, S3 bucket prefixes per environment)
  - GitHub OIDC deploy role for CI

- **Parameters**
  - `Env` (AllowedValues: `dev`, `prod`), `EnableCloudFront` (default `false`), `WebDomainName` (optional)

- **Outputs**
  - `ApiBaseUrl, UserPoolId, UserPoolClientId, Region, TableName, AssetsBucket, WebBucketUrl`

**CFN Snippet (env guard)**
```yaml
Parameters:
  Env:
    Type: String
    AllowedValues: [dev, prod]
    Default: dev
```

---

## 10) Local Development (Docker) & Config

**docker/compose.local.yml**
- `amazon/dynamodb-local` on `8000`
- `localstack/localstack` (S3, SES) on `4566`
- Optional `mailhog` UI on `8025` when mocking email

**.env examples**
```
# DEV (local)
AWS_REGION=us-east-1
ENV=dev
TABLE_NAME=couriercue-dev-main
ASSETS_BUCKET=couriercue-dev-assets
API_BASE_URL=http://localhost:3000
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
```

**Commands (npm workspaces or pnpm)**
```
# root
pnpm dev:web      # Vite
pnpm dev:api      # SAM local start-api or esbuild watcher + lambda emulator
pnpm dev:stack    # create buckets/table in LocalStack/DDB local (scripts provided)
pnpm test         # all unit tests
pnpm test:int     # integration (LocalStack + DDB local)
pnpm e2e          # Playwright/Cypress
```

---

## 11) Testing Strategy (Testing Pyramid)

**Frontend**
- Unit: components, hooks (Vitest + React Testing Library)
- Integration: page flows with MSW (mock server)
- E2E: Playwright/Cypress scenario — *admin creates → driver signs → admin sees PDF+email*

**Backend**
- Unit: pure functions (validators, guards, mappers) — Jest
- Integration: Lambdas vs DDB Local & LocalStack S3/SES
- Contract: OpenAPI schema validation (zod-to-openapi; optional Dredd check)

**Coverage Gates**
- Global ≥80%, auth/status modules ≥90% lines/branches  
**CI**: typecheck → lint → unit → integration → (optional) e2e on label → CFN validate/lint

---

## 12) Deployment (dev & prod)

**GitHub Actions + AWS OIDC**

- **ci.yml** (all PRs): lint, typecheck, unit/integration tests, coverage gates, CFN validate/lint.
- **deploy.yml**:
  - On push to `main`: deploy **dev** stack (`Env=dev`), upload web build to `couriercue-dev-web`.
  - On **tag** `v*`: build artifacts, require **manual approval**, then deploy **prod** (`Env=prod`), upload to `couriercue-prod-web`.

**Post‑Deploy Steps per env**
- Create Cognito groups: `platformAdmin`, `admin`, `coadmin`, `driver`
- Seed: Platform Admin (dev only), an Org, an Org Admin, a Driver, example Load
- **SES**: dev can remain in sandbox; prod must have production access or verified domains

**Optional (prod)**: CloudFront + ACM + Route53 for `app.couriercue.app` (SPA) and `api.couriercue.app` (API custom domain).

---

## 13) Admin Portals

### 13.1 Org Admin
- **Dashboard**: KPI tiles; shortcuts to *New Load*, *Invite User*
- **Loads**: server‑side date/status/driver filters (GSI4) + client‑side free‑text
- **Users**: invite (email, role), enable/disable, reset link
- **Settings**: org name/logo, emailFrom (global default), billing/accounting emails, unload locations, item types, retention, feature toggles
- **Audit** (optional POC): stream of `LoadEvent`s

### 13.2 Platform Admin
- **Orgs** list/create/suspend
- Usage snapshot (loads/month, signatures, S3 bytes)
- “Impersonate Admin” for support (support token pattern; log audit)

---

## 14) UX & Design

- **Modern & accessible** (Radix + Tailwind; responsive grid; dark mode ready)
- **Driver flow**: large touch targets, minimal text, top‑fixed CTA, offline error messaging (no cache)
- **Signature**: full‑screen modal; **Clear**, **Save**; shows local time + GPS if allowed
- **Empty states** and skeleton loaders
- **Internationalization**: `en-US` for POC; strings centralized

---

## 15) Runbooks & Ops

- **Rollbacks**: CFN stack with versioned Lambda artifacts; keep previous release in S3
- **Backups**: DDB PITR (optional for POC), S3 versioning (assets)
- **Alarms**: API 5xx > 2%/5m; Lambda errors; SES bounce rate; DDB throttles
- **Incident drill**: disable problematic route via API mapping; suspend org if abuse detected
- **Retention**: per‑org `retentionDays` controls S3 object lifecycle for signatures/receipts

---

## 16) Acceptance Criteria (POC)

1. **Tenancy**: users can only access data with their `orgId`; cross‑org attempts are rejected (403).  
2. **RBAC**: route‑level guards enforce `admin/coadmin/driver` correctly.  
3. **Admin UX**: create load, assign driver, filter loads, export CSV.  
4. **Driver UX**: see only assigned loads; complete and capture signature; submit successfully.  
5. **Artifacts**: signature PNG stored in S3; PDF generated & cached; email delivered (SES sandbox acceptable in dev).  
6. **Docs**: READMEs enable a new engineer to run locally via Docker and deploy to **dev** then **prod**.  
7. **Tests**: pass with coverage thresholds; CI green on PRs; CFN validates.

---

## 17) Repository Structure & READMEs

```
couriercue/
├─ README.md                 # overview & quickstart
├─ infra/
│  ├─ stack.yaml             # CFN (buckets, ddb, cognito, api, lambdas)
│  └─ README.md              # deploy guide (params, outputs; dev & prod)
├─ api/
│  ├─ src/functions/…        # lambdas
│  ├─ src/lib/…              # db, auth, pdf, email, validation
│  ├─ openapi.yaml
│  ├─ jest.config.ts
│  └─ README.md              # run, test, env vars
├─ web/
│  ├─ src/pages/…            # Admin, Driver, Settings
│  ├─ src/components/…
│  ├─ src/styles/…
│  ├─ vitest.config.ts
│  └─ README.md              # dev server, env, tests
├─ docker/
│  ├─ compose.local.yml      # dynamodb-local, localstack, mailhog
│  ├─ seed.sh                # create demo org/users/loads locally
│  └─ README.md
└─ .github/workflows/
   ├─ ci.yml                 # lint, test, coverage, CFN validate
   └─ deploy.yml             # deploy dev on main; prod on tag (with approval)
```

**Root README Quickstart (excerpt)**
```bash
# 1) Pre-reqs: Node 20+, Docker, AWS CLI
pnpm i                   # or npm -w i
docker compose -f docker/compose.local.yml up -d
pnpm dev:api             # runs lambdas locally (SAM or esbuild watcher)
pnpm dev:web             # runs Vite web app
# Visit http://localhost:5173
```

**Infra README Deploy (excerpt)**
```bash
# Deploy DEV
aws cloudformation deploy \
  --template-file infra/stack.yaml \
  --stack-name couriercue-dev \
  --parameter-overrides Env=dev \
  --capabilities CAPABILITY_NAMED_IAM

# Deploy PROD (after approval)
aws cloudformation deploy \
  --template-file infra/stack.yaml \
  --stack-name couriercue-prod \
  --parameter-overrides Env=prod \
  --capabilities CAPABILITY_NAMED_IAM

# Set .env from stack outputs, then:
pnpm build:web && aws s3 sync web/dist s3://couriercue-<env>-web
```

---

## 18) Roadmap (Post‑POC)

- Remote signing link for shippers (no tablet)  
- Offline cache & sync (IndexedDB + service worker)  
- Search backend (OpenSearch)  
- Billing & metering (plan limits, Stripe)  
- Org‑scoped SES identities (per‑org “From”)  
- CloudFront + WAF + custom domain for prod

---

## 19) Copilot Build Tasks (ready to paste into a GitHub issue)

- [ ] Scaffold **infra/stack.yaml** with `Env ∈ {dev, prod}`: S3 (web/assets), DDB (+GSI1..GSI4), Cognito (UserPool, Client), API Gateway HTTP, minimal Lambdas, SES identity param.  
- [ ] Implement **db.ts** helpers (get/put/query/update, GSI queries).  
- [ ] Implement **auth.ts** (extract JWT claims, org guard, role guard).  
- [ ] Implement **/org/settings** GET/PATCH with zod validation.  
- [ ] Implement **/org/users** list/invite/update (Cognito Admin APIs).  
- [ ] Implement **/loads** CRUD + status transitions + audit events.  
- [ ] Implement **signature** presign/confirm (S3) and link to load.  
- [ ] Implement **receipt** generator (pdf-lib) + S3 cache.  
- [ ] Implement **email** sender (SES template).  
- [ ] Build **Admin Portal** (Dashboard, Loads w/ filters+CSV, Users, Settings).  
- [ ] Build **Driver App** (My Loads, Flow, Signature).  
- [ ] Tests: unit (api & web), integration (LocalStack/DDB), e2e (Playwright).  
- [ ] CI: lint, typecheck, tests, coverage gates, CFN validate.  
- [ ] Deploy workflow: auto to **dev** on `main`; tagged release to **prod** (manual approval).
