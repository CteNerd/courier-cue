#!/bin/bash
# Seed script for local development

set -e

echo "🌱 Seeding local CourierCue database..."

# Configuration
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
DYNAMODB_ENDPOINT="http://localhost:8000"
S3_ENDPOINT="http://localhost:4566"
TABLE_NAME="couriercue-dev-main"
BUCKET_NAME="couriercue-dev-assets"

# Wait for DynamoDB Local
echo "⏳ Waiting for DynamoDB Local..."
until aws dynamodb list-tables --endpoint-url $DYNAMODB_ENDPOINT 2>/dev/null; do
  sleep 1
done

# Wait for LocalStack
echo "⏳ Waiting for LocalStack..."
until aws s3 ls --endpoint-url $S3_ENDPOINT 2>/dev/null; do
  sleep 1
done

# Create DynamoDB table
echo "📊 Creating DynamoDB table..."
aws dynamodb create-table \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
    AttributeName=GSI3PK,AttributeType=S \
    AttributeName=GSI3SK,AttributeType=S \
    AttributeName=GSI4PK,AttributeType=S \
    AttributeName=GSI4SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"GSI1\",
        \"KeySchema\": [{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      },
      {
        \"IndexName\": \"GSI2\",
        \"KeySchema\": [{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      },
      {
        \"IndexName\": \"GSI3\",
        \"KeySchema\": [{\"AttributeName\":\"GSI3PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI3SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      },
      {
        \"IndexName\": \"GSI4\",
        \"KeySchema\": [{\"AttributeName\":\"GSI4PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI4SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      }
    ]" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  2>/dev/null || echo "Table already exists"

# Create S3 bucket
echo "🪣 Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --endpoint-url $S3_ENDPOINT 2>/dev/null || echo "Bucket already exists"

# Seed demo organization
echo "🏢 Creating demo organization..."
ORG_ID="demo-org"
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "ORG#'$ORG_ID'"},
    "orgId": {"S": "'$ORG_ID'"},
    "orgName": {"S": "Demo Organization"},
    "legalName": {"S": "Demo Org LLC"},
    "emailFrom": {"S": "noreply@demo.com"},
    "billingEmail": {"S": "billing@demo.com"},
    "plan": {"S": "basic"},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }' 2>/dev/null || echo "Demo org already exists"

# Seed demo users
echo "👤 Creating demo users..."
ADMIN_USER_ID="admin-123"
COADMIN_USER_ID="coadmin-456"
DRIVER1_USER_ID="driver1-789"
DRIVER2_USER_ID="driver2-101"

# Admin user
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$ADMIN_USER_ID'"},
    "userId": {"S": "'$ADMIN_USER_ID'"},
    "email": {"S": "admin@demo.com"},
    "displayName": {"S": "Admin User"},
    "role": {"S": "admin"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "GSI1PK": {"S": "USER#admin@demo.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' 2>/dev/null || echo "Admin user already exists"

# Co-Admin user  
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$COADMIN_USER_ID'"},
    "userId": {"S": "'$COADMIN_USER_ID'"},
    "email": {"S": "coadmin@demo.com"},
    "displayName": {"S": "Co-Admin User"},
    "role": {"S": "coadmin"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "GSI1PK": {"S": "USER#coadmin@demo.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' 2>/dev/null || echo "Co-Admin user already exists"

# Driver 1 user
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER1_USER_ID'"},
    "userId": {"S": "'$DRIVER1_USER_ID'"},
    "email": {"S": "driver1@demo.com"},
    "displayName": {"S": "Driver Johnson"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "GSI1PK": {"S": "USER#driver1@demo.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' 2>/dev/null || echo "Driver 1 user already exists"

# Driver 2 user
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER2_USER_ID'"},
    "userId": {"S": "'$DRIVER2_USER_ID'"},
    "email": {"S": "driver2@demo.com"},
    "displayName": {"S": "Driver Smith"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "GSI1PK": {"S": "USER#driver2@demo.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' 2>/dev/null || echo "Driver 2 user already exists"

# Seed demo load
echo "📦 Creating demo load..."
LOAD_ID="load-$(date +%s)"
DATE_KEY=$(date -u +%Y-%m-%d)

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "LOAD#'$LOAD_ID'"},
    "loadId": {"S": "'$LOAD_ID'"},
    "orgId": {"S": "'$ORG_ID'"},
    "status": {"S": "ASSIGNED"},
    "assignedDriverId": {"S": "'$DRIVER1_USER_ID'"},
    "serviceAddress": {"M": {
      "name": {"S": "COLOPLAST DISTRIBUTION"},
      "street": {"S": "4008 HERITAGE DRIVE"},
      "city": {"S": "Brookshire"},
      "state": {"S": "TX"},
      "zip": {"S": "77423"},
      "contact": {"S": "JAKE MORRIS"},
      "phone": {"S": "832-815-1380"},
      "email": {"S": "jmorris@example.com"}
    }},
    "items": {"L": [
      {"M": {
        "type": {"S": "USED_48x40_CORE"},
        "qty": {"N": "1"}
      }}
    ]},
    "unloadLocation": {"S": "YARD_1"},
    "shipVia": {"S": "AAA-SWAP"},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "updatedAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "createdBy": {"S": "'$ADMIN_USER_ID'"},
    "GSI2PK": {"S": "DRIVER#'$DRIVER1_USER_ID'"},
    "GSI2SK": {"S": "'$DATE_KEY'#LOAD#'$LOAD_ID'"},
    "GSI3PK": {"S": "STATUS#ASSIGNED"},
    "GSI3SK": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'#LOAD#'$LOAD_ID'"},
    "GSI4PK": {"S": "ORG#'$ORG_ID'#LOADS"},
    "GSI4SK": {"S": "'$DATE_KEY'#ASSIGNED#'$LOAD_ID'"}
  }' 2>/dev/null || echo "Demo load already exists"

# Seed dock yards
echo "🏭 Creating demo dock yards..."
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCKYARD#dy-001"},
    "dockYardId": {"S": "dy-001"},
    "name": {"S": "Dallas Distribution Center"},
    "address": {"S": "5000 Distribution Parkway, Dallas, TX 75201"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-01-15T08:00:00Z"},
    "updatedAt": {"S": "2025-01-15T08:00:00Z"}
  }' 2>/dev/null || echo "Dock yard dy-001 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCKYARD#dy-002"},
    "dockYardId": {"S": "dy-002"},
    "name": {"S": "Houston Logistics Hub"},
    "address": {"S": "2500 Port Boulevard, Houston, TX 77001"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-02-10T09:00:00Z"},
    "updatedAt": {"S": "2025-02-10T09:00:00Z"}
  }' 2>/dev/null || echo "Dock yard dy-002 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCKYARD#dy-003"},
    "dockYardId": {"S": "dy-003"},
    "name": {"S": "Austin Warehouse"},
    "address": {"S": "1200 Industrial Drive, Austin, TX 78701"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-03-20T10:00:00Z"},
    "updatedAt": {"S": "2025-03-20T10:00:00Z"}
  }' 2>/dev/null || echo "Dock yard dy-003 already exists"

# Seed docks
echo "🚪 Creating demo docks..."
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCK#dock-001"},
    "dockId": {"S": "dock-001"},
    "name": {"S": "Dock A1"},
    "dockType": {"S": "flatbed"},
    "dockYardId": {"S": "dy-001"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-01-15T08:30:00Z"},
    "updatedAt": {"S": "2025-01-15T08:30:00Z"}
  }' 2>/dev/null || echo "Dock dock-001 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCK#dock-002"},
    "dockId": {"S": "dock-002"},
    "name": {"S": "Dock A2"},
    "dockType": {"S": "drop-in"},
    "dockYardId": {"S": "dy-001"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-01-15T08:35:00Z"},
    "updatedAt": {"S": "2025-01-15T08:35:00Z"}
  }' 2>/dev/null || echo "Dock dock-002 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCK#dock-003"},
    "dockId": {"S": "dock-003"},
    "name": {"S": "Dock B1"},
    "dockType": {"S": "flatbed"},
    "dockYardId": {"S": "dy-002"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-02-10T09:30:00Z"},
    "updatedAt": {"S": "2025-02-10T09:30:00Z"}
  }' 2>/dev/null || echo "Dock dock-003 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCK#dock-004"},
    "dockId": {"S": "dock-004"},
    "name": {"S": "Dock B2"},
    "dockType": {"S": "drop-in"},
    "dockYardId": {"S": "dy-002"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-02-10T09:35:00Z"},
    "updatedAt": {"S": "2025-02-10T09:35:00Z"}
  }' 2>/dev/null || echo "Dock dock-004 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "DOCK#dock-005"},
    "dockId": {"S": "dock-005"},
    "name": {"S": "Dock C1"},
    "dockType": {"S": "flatbed"},
    "dockYardId": {"S": "dy-003"},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-03-20T10:30:00Z"},
    "updatedAt": {"S": "2025-03-20T10:30:00Z"}
  }' 2>/dev/null || echo "Dock dock-005 already exists"

# Seed trailers
echo "🚛 Creating demo trailers..."
aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-001"},
    "trailerId": {"S": "trailer-001"},
    "trailerNumber": {"S": "Trailer 101"},
    "currentDockId": {"S": "dock-001"},
    "status": {"S": "ACTIVE"},
    "registrationExpiresAt": {"S": "2026-06-15T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": true},
    "inspectionExpiresAt": {"S": "2026-03-20T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": true},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-01-20T10:00:00Z"},
    "updatedAt": {"S": "2025-01-20T10:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-001 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-002"},
    "trailerId": {"S": "trailer-002"},
    "trailerNumber": {"S": "Trailer 102"},
    "currentDockId": {"S": "dock-002"},
    "status": {"S": "ACTIVE"},
    "registrationExpiresAt": {"S": "2026-08-10T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": true},
    "inspectionExpiresAt": {"S": "2026-05-15T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": true},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-01-22T11:00:00Z"},
    "updatedAt": {"S": "2025-01-22T11:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-002 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-003"},
    "trailerId": {"S": "trailer-003"},
    "trailerNumber": {"S": "Trailer 201"},
    "currentDockId": {"S": "dock-003"},
    "status": {"S": "ACTIVE"},
    "registrationExpiresAt": {"S": "2026-07-25T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": true},
    "inspectionExpiresAt": {"S": "2025-12-30T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": true},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-02-15T09:00:00Z"},
    "updatedAt": {"S": "2025-02-15T09:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-003 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-004"},
    "trailerId": {"S": "trailer-004"},
    "trailerNumber": {"S": "Trailer 202"},
    "currentDockId": {"S": "dock-004"},
    "status": {"S": "IN_REPAIR"},
    "registrationExpiresAt": {"S": "2026-09-05T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": true},
    "inspectionExpiresAt": {"S": "2025-11-20T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": false},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-02-18T10:30:00Z"},
    "updatedAt": {"S": "2025-10-25T14:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-004 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-005"},
    "trailerId": {"S": "trailer-005"},
    "trailerNumber": {"S": "Trailer 301"},
    "currentDockId": {"S": "dock-005"},
    "status": {"S": "ACTIVE"},
    "registrationExpiresAt": {"S": "2026-04-12T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": true},
    "inspectionExpiresAt": {"S": "2026-02-28T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": true},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-03-25T13:00:00Z"},
    "updatedAt": {"S": "2025-03-25T13:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-005 already exists"

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "TRAILER#trailer-006"},
    "trailerId": {"S": "trailer-006"},
    "trailerNumber": {"S": "Trailer 302"},
    "currentDockId": {"S": "dock-005"},
    "status": {"S": "INACTIVE"},
    "registrationExpiresAt": {"S": "2025-10-15T00:00:00Z"},
    "isRegistrationCurrent": {"BOOL": false},
    "inspectionExpiresAt": {"S": "2025-09-30T00:00:00Z"},
    "isInspectionCurrent": {"BOOL": false},
    "orgId": {"S": "'$ORG_ID'"},
    "createdAt": {"S": "2025-04-10T08:00:00Z"},
    "updatedAt": {"S": "2025-10-15T16:00:00Z"}
  }' 2>/dev/null || echo "Trailer trailer-006 already exists"

echo "✅ Seeding complete!"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@demo.com / admin123"
echo "  Co-Admin: coadmin@demo.com / coadmin123" 
echo "  Driver 1: driver1@demo.com / driver123"
echo "  Driver 2: driver2@demo.com / driver123"
echo ""
echo "Services:"
echo "  DynamoDB: http://localhost:8000"
echo "  LocalStack: http://localhost:4566"
echo "  MailHog UI: http://localhost:8025"
