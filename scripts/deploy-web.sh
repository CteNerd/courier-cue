#!/bin/bash
set -e

# Deploy web application to S3
# This script builds and deploys the web app

ENVIRONMENT="${1:-dev}"
WEB_BUCKET="couriercue-${ENVIRONMENT}-web"

echo "Deploying web app to environment: $ENVIRONMENT"

# Change to web directory
cd "$(dirname "$0")/../web"

# Build the web app
echo "Building web app..."
pnpm build

# Deploy to S3
echo "Uploading to S3..."
aws s3 sync dist/ "s3://${WEB_BUCKET}" --delete

# Invalidate CloudFront cache if using CloudFront
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name "couriercue-${ENVIRONMENT}" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text 2>/dev/null || echo "")

if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --no-cli-pager > /dev/null
  echo "CloudFront invalidation created"
fi

echo "✅ Web deployment complete!"
echo "URL: https://${WEB_BUCKET}.s3-website-$(aws configure get region).amazonaws.com"
