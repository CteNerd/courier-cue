#!/bin/bash
set -e

# Full deployment pipeline: Infrastructure -> API -> Web
# Usage: ./scripts/deploy-all.sh [environment]

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(dirname "$0")"

echo "========================================"
echo "Starting full deployment: $ENVIRONMENT"
echo "========================================"

# Step 1: Deploy infrastructure (CloudFormation)
echo ""
echo "Step 1: Deploying infrastructure..."
cd "$SCRIPT_DIR/.."
aws cloudformation deploy \
  --template-file infra/stack.yaml \
  --stack-name "couriercue-${ENVIRONMENT}" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment="${ENVIRONMENT}"

# Step 2: Deploy API functions
echo ""
echo "Step 2: Deploying API functions..."
bash "$SCRIPT_DIR/deploy-api.sh" "couriercue-${ENVIRONMENT}" "$ENVIRONMENT"

# Step 3: Deploy web app
echo ""
echo "Step 3: Deploying web app..."
bash "$SCRIPT_DIR/deploy-web.sh" "$ENVIRONMENT"

echo ""
echo "========================================"
echo "✅ Full deployment complete!"
echo "========================================"
echo ""
echo "API URL: $(aws cloudformation describe-stacks --stack-name couriercue-${ENVIRONMENT} --query 'Stacks[0].Outputs[?OutputKey==`ApiBaseUrl`].OutputValue' --output text)"
echo "Web URL: $(aws cloudformation describe-stacks --stack-name couriercue-${ENVIRONMENT} --query 'Stacks[0].Outputs[?OutputKey==`WebBucketUrl`].OutputValue' --output text)"
