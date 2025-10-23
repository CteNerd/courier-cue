# Local Development Environment

Docker Compose setup for local CourierCue development.

## Services

### DynamoDB Local
- **Port**: 8000
- **Purpose**: Local DynamoDB for testing
- **Image**: amazon/dynamodb-local

### LocalStack
- **Port**: 4566 (main), 4510-4559 (extended)
- **Services**: S3, SES
- **Purpose**: Mock AWS services locally
- **Image**: localstack/localstack

### MailHog
- **SMTP Port**: 1025
- **Web UI Port**: 8025
- **Purpose**: Email testing and debugging
- **Image**: mailhog/mailhog

## Usage

### Start Services

```bash
docker compose -f docker/compose.local.yml up -d
```

### Stop Services

```bash
docker compose -f docker/compose.local.yml down
```

### View Logs

```bash
docker compose -f docker/compose.local.yml logs -f
```

### Seed Database

After starting services, run the seed script:

```bash
# From project root
pnpm dev:stack
# or: bash docker/seed.sh
```

This creates:
- DynamoDB table with GSIs
- S3 bucket
- Demo organization
- Demo users (admin, driver)
- Sample load

## Accessing Services

### DynamoDB Local

List tables:
```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:8000
```

Scan table:
```bash
aws dynamodb scan \
  --endpoint-url http://localhost:8000 \
  --table-name couriercue-dev-main
```

### LocalStack S3

List buckets:
```bash
aws s3 ls \
  --endpoint-url http://localhost:4566
```

Upload file:
```bash
aws s3 cp file.png s3://couriercue-dev-assets/test/ \
  --endpoint-url http://localhost:4566
```

### MailHog

View sent emails:
- Open http://localhost:8025 in browser
- All emails sent via SMTP on port 1025 appear here

## Demo Data

The seed script creates:

**Organization**: demo-org
- Name: Demo Organization
- Email: noreply@demo.com

**Users**:
- Admin: admin@demo.com (admin-123) - Full system access
- Co-Admin: coadmin@demo.com (coadmin-456) - Operational access, can view users but not manage them
- Driver 1: driver1@demo.com (driver1-789) - Active driver (Driver Johnson)
- Driver 2: driver2@demo.com (driver2-101) - Active driver (Driver Smith)

**Loads**: Sample loads with various statuses assigned to drivers

**Note**: The demo data includes users with different roles and statuses to test the complete user management workflow, including co-admin permission restrictions.

## Environment Variables

When running API locally, use:

```bash
# .env
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000
S3_ENDPOINT=http://localhost:4566
SES_ENDPOINT=http://localhost:4566
TABLE_NAME=couriercue-dev-main
ASSETS_BUCKET=couriercue-dev-assets
```

## Troubleshooting

### LocalStack "Device or resource busy" error

This is a common issue when LocalStack can't clean up its temp directory:

```bash
# Solution: Stop containers and clean up
docker compose -f docker/compose.local.yml down
docker volume prune -f
docker compose -f docker/compose.local.yml up -d
```

**Root cause**: The original configuration used bind mounts that conflicted with LocalStack's internal directory management. This has been fixed by using named Docker volumes.

### Services won't start

Check if ports are already in use:
```bash
lsof -i :8000  # DynamoDB
lsof -i :4566  # LocalStack
lsof -i :8025  # MailHog
```

### Can't connect to services

Ensure services are healthy:
```bash
docker compose -f docker/compose.local.yml ps
```

All containers should show `Up` status. LocalStack may show `(health: starting)` briefly.

### Seed script hangs on pager

If the seed script gets stuck in a pager (like `less`):
- Press `q` to quit the pager
- Or disable paging: `export AWS_PAGER=""`

### Data persistence

Data is stored in memory by default. To persist:
1. Remove `-inMemory` flag from DynamoDB command
2. Add volume mounts for LocalStack

### Reset everything

```bash
docker compose -f docker/compose.local.yml down -v
docker compose -f docker/compose.local.yml up -d
pnpm dev:stack  # Re-seed database
```

## Integration Tests

Integration tests are planned to use these services but not yet implemented:

```bash
# Start services
docker compose -f docker/compose.local.yml up -d

# Integration tests (planned)
# cd api && pnpm test:int
# cd ../web && pnpm test:int
```
