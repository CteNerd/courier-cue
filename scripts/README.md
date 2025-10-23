# Deployment Scripts

This directory contains scripts for deploying CourierCue to AWS.

## Scripts

### `deploy-all.sh`
Full deployment pipeline that deploys infrastructure, API, and web app.

```bash
# Deploy to dev environment (default)
./scripts/deploy-all.sh

# Deploy to prod environment
./scripts/deploy-all.sh prod
```

### `deploy-api.sh`
Deploy only the API Lambda functions. This script:
1. Builds the API with `pnpm build`
2. Packages functions into a timestamped zip file
3. Uploads to S3
4. Updates all Lambda functions with the new code

```bash
# Deploy API to dev environment
./scripts/deploy-api.sh couriercue-dev dev

# Deploy API to prod environment
./scripts/deploy-api.sh couriercue-prod prod
```

### `deploy-web.sh`
Deploy only the web application. This script:
1. Builds the web app with `pnpm build`
2. Syncs to S3
3. Invalidates CloudFront cache if applicable

```bash
# Deploy web to dev environment
./scripts/deploy-web.sh dev

# Deploy web to prod environment
./scripts/deploy-web.sh prod
```

## Manual Deployment

If you need to deploy manually:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Full deployment
./scripts/deploy-all.sh dev

# Or deploy components individually
./scripts/deploy-api.sh couriercue-dev dev
./scripts/deploy-web.sh dev
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
- Deploys to dev on push to `main`
- Deploys to prod on release
- Uses these scripts to ensure Lambda functions are properly updated

## Why These Scripts?

CloudFormation doesn't automatically update Lambda function code when only the code changes (not the template). These scripts ensure:
1. Code is built fresh
2. Code is uploaded to S3 with a unique version
3. All Lambda functions are explicitly updated with the new code
4. No manual intervention needed

## Environment Variables

The scripts expect these AWS resources to exist:
- S3 Bucket: `couriercue-{env}-deployment` (for Lambda code)
- S3 Bucket: `couriercue-{env}-web` (for web app)
- CloudFormation Stack: `couriercue-{env}`

These are created by the CloudFormation template in `infra/stack.yaml`.
