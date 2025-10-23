#!/bin/bash

# Seed production-like data to DynamoDB
# Run this from the docker directory

TABLE_NAME="couriercue-dev-main"
REGION="us-east-1"
ORG_ID="org_123"
DRIVER1_ID="driver-mike-johnson"
DRIVER2_ID="driver-sarah-wilson"
DRIVER3_ID="driver-john-davis"
DRIVER4_ID="driver-emily-rodriguez"

echo "Seeding production data to $TABLE_NAME..."

# Create Driver Users
echo "Creating driver users..."

aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER1_ID'"},
    "userId": {"S": "'$DRIVER1_ID'"},
    "email": {"S": "mike.johnson@couriertest.com"},
    "displayName": {"S": "Mike Johnson"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "2025-10-20T08:00:00Z"},
    "GSI1PK": {"S": "USER#mike.johnson@couriertest.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' \
  --region $REGION

aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER2_ID'"},
    "userId": {"S": "'$DRIVER2_ID'"},
    "email": {"S": "sarah.wilson@couriertest.com"},
    "displayName": {"S": "Sarah Wilson"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "2025-10-20T08:00:00Z"},
    "GSI1PK": {"S": "USER#sarah.wilson@couriertest.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' \
  --region $REGION

aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER3_ID'"},
    "userId": {"S": "'$DRIVER3_ID'"},
    "email": {"S": "john.davis@couriertest.com"},
    "displayName": {"S": "John Davis"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "2025-10-20T08:00:00Z"},
    "GSI1PK": {"S": "USER#john.davis@couriertest.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' \
  --region $REGION

aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "USER#'$DRIVER4_ID'"},
    "userId": {"S": "'$DRIVER4_ID'"},
    "email": {"S": "emily.rodriguez@couriertest.com"},
    "displayName": {"S": "Emily Rodriguez"},
    "role": {"S": "driver"},
    "isDisabled": {"BOOL": false},
    "createdAt": {"S": "2025-10-20T08:00:00Z"},
    "GSI1PK": {"S": "USER#emily.rodriguez@couriertest.com"},
    "GSI1SK": {"S": "ORG#'$ORG_ID'"}
  }' \
  --region $REGION

# Update existing loads with driver assignment
echo "Updating load_001 with driver assignment..."
aws dynamodb update-item \
  --table-name $TABLE_NAME \
  --key '{"PK":{"S":"ORG#'$ORG_ID'"},"SK":{"S":"LOAD#load_001"}}' \
  --update-expression "SET assignedDriverId = :driverId, #status = :status" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{
    ":driverId":{"S":"'$DRIVER1_ID'"},
    ":status":{"S":"ASSIGNED"}
  }' \
  --region $REGION

echo "Updating GSI4SK for load_001..."
aws dynamodb update-item \
  --table-name $TABLE_NAME \
  --key '{"PK":{"S":"ORG#'$ORG_ID'"},"SK":{"S":"LOAD#load_001"}}' \
  --update-expression "SET GSI4SK = :gsi4sk" \
  --expression-attribute-values '{":gsi4sk":{"S":"2025-10-23#ASSIGNED#load_001"}}' \
  --region $REGION

# Add more loads
echo "Adding load_003..."
aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "LOAD#load_003"},
    "orgId": {"S": "'$ORG_ID'"},
    "loadId": {"S": "load_003"},
    "status": {"S": "EN_ROUTE"},
    "assignedDriverId": {"S": "'$DRIVER2_ID'"},
    "serviceAddress": {"M": {
      "name": {"S": "Tech Solutions Inc"},
      "street": {"S": "789 Innovation Blvd"},
      "city": {"S": "Austin"},
      "state": {"S": "TX"},
      "zip": {"S": "78701"},
      "contact": {"S": "512-555-0303"},
      "lat": {"N": "30.2672"},
      "lng": {"N": "-97.7431"}
    }},
    "items": {"L": [
      {"M": {
        "description": {"S": "Computer Servers"},
        "quantity": {"N": "5"},
        "weight": {"S": "200 lbs"}
      }}
    ]},
    "notes": {"S": "Fragile - Handle with care"},
    "createdAt": {"S": "2025-10-23T10:00:00Z"},
    "updatedAt": {"S": "2025-10-23T14:30:00Z"},
    "GSI4PK": {"S": "ORG#'$ORG_ID'#LOADS"},
    "GSI4SK": {"S": "2025-10-23#EN_ROUTE#load_003"}
  }' \
  --region $REGION

echo "Adding load_004..."
aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "LOAD#load_004"},
    "orgId": {"S": "'$ORG_ID'"},
    "loadId": {"S": "load_004"},
    "status": {"S": "DELIVERED"},
    "assignedDriverId": {"S": "'$DRIVER3_ID'"},
    "serviceAddress": {"M": {
      "name": {"S": "Downtown Office Supply"},
      "street": {"S": "456 Main Street"},
      "city": {"S": "Houston"},
      "state": {"S": "TX"},
      "zip": {"S": "77002"},
      "contact": {"S": "713-555-0404"},
      "lat": {"N": "29.7604"},
      "lng": {"N": "-95.3698"}
    }},
    "items": {"L": [
      {"M": {
        "description": {"S": "Office Furniture"},
        "quantity": {"N": "10"},
        "weight": {"S": "500 lbs"}
      }},
      {"M": {
        "description": {"S": "Desk Chairs"},
        "quantity": {"N": "20"},
        "weight": {"S": "300 lbs"}
      }}
    ]},
    "notes": {"S": "Delivered and signed"},
    "createdAt": {"S": "2025-10-22T08:00:00Z"},
    "updatedAt": {"S": "2025-10-23T16:00:00Z"},
    "deliveredAt": {"S": "2025-10-23T16:00:00Z"},
    "GSI4PK": {"S": "ORG#'$ORG_ID'#LOADS"},
    "GSI4SK": {"S": "2025-10-22#DELIVERED#load_004"}
  }' \
  --region $REGION

echo "Adding load_005..."
aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item '{
    "PK": {"S": "ORG#'$ORG_ID'"},
    "SK": {"S": "LOAD#load_005"},
    "orgId": {"S": "'$ORG_ID'"},
    "loadId": {"S": "load_005"},
    "status": {"S": "PENDING"},
    "serviceAddress": {"M": {
      "name": {"S": "Warehouse Distribution Center"},
      "street": {"S": "999 Industrial Park Dr"},
      "city": {"S": "San Antonio"},
      "state": {"S": "TX"},
      "zip": {"S": "78219"},
      "contact": {"S": "210-555-0505"},
      "lat": {"N": "29.4241"},
      "lng": {"N": "-98.4936"}
    }},
    "items": {"L": [
      {"M": {
        "description": {"S": "Electronics"},
        "quantity": {"N": "50"},
        "weight": {"S": "1000 lbs"}
      }}
    ]},
    "notes": {"S": "Needs driver assignment"},
    "createdAt": {"S": "2025-10-23T15:00:00Z"},
    "updatedAt": {"S": "2025-10-23T15:00:00Z"},
    "GSI4PK": {"S": "ORG#'$ORG_ID'#LOADS"},
    "GSI4SK": {"S": "2025-10-23#PENDING#load_005"}
  }' \
  --region $REGION

echo "✅ Production data seeded successfully!"
echo ""
echo "Summary:"
echo "- load_001: ASSIGNED to Mike Johnson (ABC Manufacturing - Dallas)"
echo "- load_002: PENDING (XYZ Corp - Houston)"
echo "- load_003: EN_ROUTE with Sarah Wilson (Tech Solutions - Austin)"
echo "- load_004: DELIVERED by John Davis (Downtown Office Supply - Houston)"
echo "- load_005: PENDING (Warehouse Distribution - San Antonio)"
echo ""
echo "Drivers created:"
echo "- Mike Johnson (mike.johnson@couriertest.com)"
echo "- Sarah Wilson (sarah.wilson@couriertest.com)"
echo "- John Davis (john.davis@couriertest.com)"
echo "- Emily Rodriguez (emily.rodriguez@couriertest.com)"
