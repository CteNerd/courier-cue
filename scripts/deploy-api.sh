#!/bin/bash
set -e

# Deploy API Lambda functions to AWS
# This script builds, packages, and deploys the API functions

STACK_NAME="${1:-couriercue-dev}"
ENVIRONMENT="${2:-dev}"
DEPLOYMENT_BUCKET="couriercue-${ENVIRONMENT}-deployment"

echo "Deploying API to stack: $STACK_NAME (environment: $ENVIRONMENT)"

# Change to api directory
cd "$(dirname "$0")/../api"

# Build the API
echo "Building API..."
pnpm build

# Create deployment package
echo "Creating deployment package..."
cd dist
TIMESTAMP=$(date +%s)
PACKAGE_NAME="functions-${TIMESTAMP}.zip"
zip -r "$PACKAGE_NAME" loads/ org/

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "$PACKAGE_NAME" "s3://${DEPLOYMENT_BUCKET}/api/${PACKAGE_NAME}"
aws s3 cp "$PACKAGE_NAME" "s3://${DEPLOYMENT_BUCKET}/api/functions.zip"

# Update all Lambda functions with new code
echo "Updating Lambda functions..."
FUNCTIONS=(
  "couriercue-${ENVIRONMENT}-org-get-settings"
  "couriercue-${ENVIRONMENT}-org-update-settings"
  "couriercue-${ENVIRONMENT}-org-list-users"
  "couriercue-${ENVIRONMENT}-org-invite-user"
  "couriercue-${ENVIRONMENT}-loads-create"
  "couriercue-${ENVIRONMENT}-loads-list"
  "couriercue-${ENVIRONMENT}-loads-get"
  "couriercue-${ENVIRONMENT}-loads-update"
  "couriercue-${ENVIRONMENT}-loads-my"
  "couriercue-${ENVIRONMENT}-loads-update-status"
  "couriercue-${ENVIRONMENT}-loads-signature-presign"
  "couriercue-${ENVIRONMENT}-loads-signature-confirm"
  "couriercue-${ENVIRONMENT}-loads-get-receipt"
  "couriercue-${ENVIRONMENT}-loads-send-email"
)

for FUNCTION in "${FUNCTIONS[@]}"; do
  echo "Updating $FUNCTION..."
  aws lambda update-function-code \
    --function-name "$FUNCTION" \
    --s3-bucket "$DEPLOYMENT_BUCKET" \
    --s3-key "api/${PACKAGE_NAME}" \
    --no-cli-pager > /dev/null
done

# Clean up
rm "$PACKAGE_NAME"

echo "✅ API deployment complete!"
echo "Package: s3://${DEPLOYMENT_BUCKET}/api/${PACKAGE_NAME}"
