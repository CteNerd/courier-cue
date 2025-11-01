# CourierCue – Spec v2: Load Detail Fixes, Trailers, Docks, and Driver Experience

Version: 2.0  
Envs: **dev** and **prod**  
Depends on: `/CourierCue-Spec-dev-prod.md` (base SaaS spec)

---

## 1. Background / Current Issues
...
(Truncated in code for brevity; full content provided in assistant message.)

## 2. Objectives

1. **Fix driver load detail** so that drivers can open and view the loads that appear in their list.
2. **Enable Admin / Co‑Admin load detail and editing** (loads are not disabled for them).
3. **Add Trailer management** for the organization.
4. **Add Dock & Dock Yard management** for the organization.
5. **Update Load creation** to associate trailer + trailer location + dock/dock yard and show this to the driver.
6. **Keep RBAC** exactly as described in the base spec (drivers cannot modify, admins/coadmins can).

## 3. Issue Analysis (Current Behavior)

### 3.1 Driver “Load not found”
- frontend list might be using a label like `load_001` but backend expects the real `loadId`
- backend returns 404 when driver isn't allowed or the load is in another org
- we want: 404 only when the load truly doesn't exist in the driver's org; 403 when driver is not assigned

### 3.2 Admin / Co‑Admin rows disabled
- loads page should allow admin/coadmin to click into any load in their org
- driver stays read‑only

## 4. Spec Changes

### 4.1 API Changes – Loads

- `GET /loads/my` must return the **true** `loadId`.
- `GET /loads/{id}` must allow drivers **iff** they are assigned to that load.
- `PATCH /loads/{id}` allowed for admin and coadmin only.
- load entity gains: `trailerId`, `trailerLocationId` (dock), `dockYardId`, `manifest[]`.

### 4.2 New Entity: Trailer
Stored as `PK=ORG#<orgId>`, `SK=TRAILER#<trailerId>`.
Fields:
- `trailerNumber`
- `currentDockId`
- `registrationExpiresAt`
- `inspectionExpiresAt`
- `isRegistrationCurrent`
- `isInspectionCurrent`
- `status` (ACTIVE | INACTIVE | IN_REPAIR)
- computed compliance: COMPLIANT / NEEDS UPDATING

APIs:
- `GET /trailers`
- `POST /trailers`
- `PATCH /trailers/{id}`

### 4.3 New Entity: Dock Yard
- `PK=ORG#<orgId>`
- `SK=DOCKYARD#<dockYardId>`
- `name`, optional address

APIs:
- `GET /dockyards`
- `POST /dockyards`
- `PATCH /dockyards/{id}`

### 4.4 New Entity: Dock
- `PK=ORG#<orgId>`
- `SK=DOCK#<dockId>`
- `name`
- `dockYardId`
- `dockType` (flatbed | drop-in)
- `notes`

APIs:
- `GET /docks`
- `POST /docks`
- `PATCH /docks/{id}`

## 5. RBAC Summary

| Role           | View Load | Edit Load | View Trailer | Edit Trailer | View Dock/DockYard | Edit Dock/DockYard |
|----------------|-----------|-----------|--------------|--------------|--------------------|--------------------|
| platformAdmin  | yes       | yes       | yes          | yes          | yes                | yes                |
| admin          | yes       | yes       | yes          | yes          | yes                | yes                |
| coadmin        | yes       | yes       | yes          | yes          | yes                | yes                |
| driver         | yes (assigned only) | no | yes (only trailer on their load) | no | read dock on their load | no |

## 6. Acceptance Criteria

1. Driver can open any load returned from “My Loads” without 404.
2. Admin / Co‑Admin can click/load any load in the list and edit it.
3. Admin / Co‑Admin can create and manage trailers.
4. Admin / Co‑Admin can create and manage docks and dock yards.
5. When admin creates a load, they can pick a trailer and a trailer location.
6. Driver detail shows trailer number, pickup dock, and compliance.
7. Drivers cannot edit load data.

---
