Goal
Create a minimal, deployable foundation for a serverless web app with GitHub Actions CI/CD and AWS SAM. No business logic yet—just the skeleton that deploys.
Architecture (foundation only)
• Frontend: React + TypeScript PWA hosted on GitHub Pages
• Backend: API Gateway → Lambda (Node.js 20) via AWS SAM
• Auth: Cognito User Pool (email as username)
• Data: DynamoDB single-table (empty for now)
• Observability: CloudWatch logs enabled
• CI/CD: GitHub Actions uses OIDC to assume an AWS IAM role and runs SAM; a separate Pages workflow builds/deploys the PWA
• Naming: Stack outputs include ApiUrl, UserPoolId, UserPoolClientId
Repo deliverables
• Folders: /web, /src/handlers (empty placeholders), /docs
• Files: template.yaml, README.md, .gitignore, LICENSE (MIT), basic lint/format configs for web and lambda code
• GitHub Actions: deploy-backend.yml (SAM), deploy-frontend.yml (Pages)
• No secrets committed; Pages URL used as Cognito callback/logout URL
Cognito (foundation)
• User Pool with email-as-username, email verification, forgot-password enabled
• Public app client (no secret) for SPA
• Groups created: dispatcher, driver, admin (no UI or seeding yet)
DynamoDB (foundation)
• Single table created and available; no items or indexes required at this step beyond PK/SK
• Table name exposed to Lambdas via env var but handlers can be stubs
API (foundation)
• REST base path reserved: /api/v1
• Health endpoint responding OK to verify plumbing
• API URL exported as ApiUrl output
GitHub Actions (foundation)
• OIDC role assumption using environment secrets AWS_ROLE_TO_ASSUME and AWS_REGION
• Backend workflow: checkout → configure AWS → sam validate/build/deploy → export stack outputs as artifact
• Frontend workflow: fetch stack outputs → write Vite env vars → build → deploy to Pages
Frontend (foundation)
• React + TS PWA scaffold with a landing screen showing app name, build info, and a “Sign in” button wired to Cognito Hosted UI (placeholder)
• Reads env vars for API base URL and Cognito IDs
• Basic routing in place; no domain logic
Observability & ops (foundation)
• Structured logging enabled for Lambdas
• README documents one-click deploy via Actions, and Pages URL for callbacks
Acceptance criteria
• Backend stack deploys successfully via GitHub Actions
• Cognito Hosted UI launches from the PWA and returns to Pages URL
• Health endpoint returns success at {ApiUrl}/health
• Frontend builds and publishes to GitHub Pages with correct env wiring
• No business endpoints or data yet—just plumbing is green
Non-goals in this step
• No order, driver, or assignment logic
• No signature capture
• No S3 buckets (not needed in this app)