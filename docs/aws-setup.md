# AWS Setup Guide

This guide walks you through setting up AWS infrastructure for GitHub Actions deployment.

## Prerequisites
- AWS CLI installed and configured
- GitHub repository with Actions enabled
- Admin access to AWS account

## 1. Create OIDC Identity Provider

```bash
# Create the OIDC provider for GitHub Actions
aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## 2. Create IAM Role for GitHub Actions

Create a trust policy file `github-actions-trust-policy.json`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/courier-cue:*"
                }
            }
        }
    ]
}
```

Create the role:

```bash
# Replace YOUR_ACCOUNT_ID and YOUR_GITHUB_USERNAME in the trust policy first
aws iam create-role \
    --role-name GitHubActions-CourierCue \
    --assume-role-policy-document file://github-actions-trust-policy.json
```

## 3. Attach Policies to the Role

```bash
# CloudFormation permissions for SAM
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AWSCloudFormationFullAccess

# S3 permissions for SAM artifacts
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Lambda permissions
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AWSLambda_FullAccess

# API Gateway permissions
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator

# DynamoDB permissions
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Cognito permissions
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser

# IAM permissions for role creation
aws iam attach-role-policy \
    --role-name GitHubActions-CourierCue \
    --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

## 4. Configure GitHub Secrets

In your GitHub repository, go to Settings → Secrets and Variables → Actions and add:

- **AWS_ROLE_TO_ASSUME**: `arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActions-CourierCue`
- **AWS_REGION**: Your preferred region (e.g., `us-east-1`)

## 5. Enable GitHub Pages

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Save the configuration

## 6. Deploy

Push to the main branch to trigger the deployment:

```bash
git add .
git commit -m "Initial foundation deployment"
git push origin main
```

## Verification

After deployment completes:

1. Check GitHub Actions for successful workflow runs
2. Verify stack in AWS CloudFormation console
3. Test the health endpoint: `{ApiUrl}/health`
4. Visit your GitHub Pages URL
5. Try the Cognito sign-in flow

## Troubleshooting

### Common Issues

1. **OIDC Provider Already Exists**: If you get an error about the provider existing, skip step 1
2. **Permission Denied**: Ensure your AWS CLI user has admin permissions
3. **Stack Deployment Fails**: Check CloudFormation events in AWS console
4. **Pages Not Loading**: Verify GitHub Pages is configured correctly

### Useful Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name courier-cue-backend

# View stack outputs
aws cloudformation describe-stacks \
    --stack-name courier-cue-backend \
    --query 'Stacks[0].Outputs'

# Delete stack (if needed)
aws cloudformation delete-stack --stack-name courier-cue-backend
```
