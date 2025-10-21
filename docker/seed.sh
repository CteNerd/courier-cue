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
DRIVER_USER_ID="driver-456"

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

aws dynamodb put-item \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER_USER_ID'"},
    "userId": {"S": "'$DRIVER_USER_ID'"},
    "email": {"S": "driver@demo.com"},
    "displayName": {"S": "Driver User"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "GSI1PK": {"S": "USER#driver@demo.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' 2>/dev/null || echo "Driver user already exists"

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
    "assignedDriverId": {"S": "'$DRIVER_USER_ID'"},
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
    "GSI2PK": {"S": "DRIVER#'$DRIVER_USER_ID'"},
    "GSI2SK": {"S": "'$DATE_KEY'#LOAD#'$LOAD_ID'"},
    "GSI3PK": {"S": "STATUS#ASSIGNED"},
    "GSI3SK": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'#LOAD#'$LOAD_ID'"},
    "GSI4PK": {"S": "ORG#'$ORG_ID'#LOADS"},
    "GSI4SK": {"S": "'$DATE_KEY'#ASSIGNED#'$LOAD_ID'"}
  }' 2>/dev/null || echo "Demo load already exists"

echo "✅ Seeding complete!"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@demo.com"
echo "  Driver: driver@demo.com"
echo ""
echo "Services:"
echo "  DynamoDB: http://localhost:8000"
echo "  LocalStack: http://localhost:4566"
echo "  MailHog UI: http://localhost:8025"
