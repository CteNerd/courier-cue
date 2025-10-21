# Next Steps for CourierCue

This document outlines the recommended next steps to complete the CourierCue application and make it production-ready.

## Phase 1: API Gateway Integration (High Priority)

### 1. Update CloudFormation Template

Add API Gateway routes and integrations to `infra/stack.yaml`:

```yaml
# Add after HttpApiAuthorizer resource

# Organization Routes
OrgSettingsRoute:
  Type: AWS::ApiGatewayV2::Route
  Properties:
    ApiId: !Ref HttpApi
    RouteKey: 'GET /org/settings'
    AuthorizationType: JWT
    AuthorizerId: !Ref HttpApiAuthorizer
    Target: !Sub 'integrations/${OrgSettingsIntegration}'

OrgSettingsIntegration:
  Type: AWS::ApiGatewayV2::Integration
  Properties:
    ApiId: !Ref HttpApi
    IntegrationType: AWS_PROXY
    IntegrationUri: !GetAtt OrgSettingsFunction.Arn
    PayloadFormatVersion: '2.0'

OrgSettingsFunctionPermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !Ref OrgSettingsFunction
    Action: lambda:InvokeFunction
    Principal: apigateway.amazonaws.com
    SourceArn: !Sub 'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${HttpApi}/*/*'

# Repeat for all other endpoints...
```

### 2. Update Lambda Functions

Replace placeholder Lambda code in CloudFormation with actual function deployment:

```yaml
OrgSettingsFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: !Sub 'couriercue-${Env}-org-settings'
    Runtime: nodejs20.x
    Handler: get-settings.handler
    Role: !GetAtt LambdaExecutionRole.Arn
    Code:
      S3Bucket: !Sub 'couriercue-${Env}-deployment'
      S3Key: !Sub 'api/${GitCommitSha}/functions.zip'
    # ... rest of config
```

### 3. Create Deployment Bucket

Add to CloudFormation:

```yaml
DeploymentBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub 'couriercue-${Env}-deployment'
    VersioningConfiguration:
      Status: Enabled
```

### 4. Update Deploy Workflow

Modify `.github/workflows/deploy.yml` to package and upload Lambda functions:

```yaml
- name: Package Lambda functions
  run: |
    cd api/dist/functions
    zip -r functions.zip .
    
- name: Upload Lambda package
  run: |
    aws s3 cp api/dist/functions/functions.zip \
      s3://couriercue-${ENV}-deployment/api/${GITHUB_SHA}/
```

## Phase 2: Complete Frontend UI Components (High Priority)

### 1. Loads Management Page

**File**: `web/src/pages/LoadsPage.tsx`

- Table with virtualization (`@tanstack/react-table`)
- Filters (status, date range, driver, search)
- Create/Edit load modal
- Export to CSV functionality
- Status badges

### 2. Signature Capture Component

**File**: `web/src/components/SignatureCanvas.tsx`

```typescript
import SignaturePad from 'react-signature-canvas';

// Features:
// - Full-screen modal
// - Clear and Save buttons
// - Geolocation capture (optional)
// - Canvas-to-PNG conversion
// - Upload to S3 via presigned URL
```

### 3. Driver Load Details

**File**: `web/src/pages/LoadDetailsPage.tsx` (enhance existing)

- Display service address, items, notes
- Status update buttons
- Signature capture flow
- Receipt viewing/downloading
- Email receipt button

### 4. Users Management

**File**: `web/src/pages/UsersPage.tsx` (enhance existing)

- User table with role badges
- Invite user modal
- Enable/disable actions
- Role change functionality

### 5. Settings Page

**File**: `web/src/pages/SettingsPage.tsx` (enhance existing)

- Organization info form
- Logo upload (S3 presigned)
- Email configuration
- Retention settings
- Feature toggles

### 6. Shared UI Components

Create in `web/src/components/ui/`:

- `Button.tsx` - Reusable button with variants
- `Input.tsx` - Form input component
- `Select.tsx` - Dropdown select
- `Modal.tsx` - Dialog/modal wrapper
- `Table.tsx` - Data table wrapper
- `Badge.tsx` - Status badges
- `Card.tsx` - Container component

## Phase 3: Testing (Medium Priority)

### 1. Expand Unit Tests

**API Tests**:
- Load creation and validation
- Status transition logic
- User invite flow
- PDF generation
- Email sending

**Frontend Tests**:
- Component rendering
- Form validation
- API client methods
- Auth flow

Target: 80% coverage

### 2. Integration Tests

**File**: `api/src/__tests__/integration/`

Tests against DynamoDB Local and LocalStack:
- Create org → create user → create load flow
- Driver signature capture flow
- Receipt generation and email
- Multi-tenant isolation

### 3. E2E Tests

**File**: `e2e/` (new directory)

Using Playwright:
- Admin login → create load → assign driver
- Driver login → view load → start → sign → complete
- Admin views receipt → sends email
- Test on both desktop and mobile viewports

## Phase 4: Production Readiness (Medium Priority)

### 1. SES Configuration

- Request production access for prod environment
- Verify sender domain
- Set up DKIM, SPF records
- Configure bounce and complaint handling

### 2. CloudFront Setup

Add to `infra/stack.yaml`:

```yaml
WebDistribution:
  Type: AWS::CloudFront::Distribution
  Condition: EnableCloudFront
  Properties:
    DistributionConfig:
      Origins:
        - DomainName: !GetAtt WebBucket.DomainName
          Id: S3Origin
          S3OriginConfig:
            OriginAccessIdentity: ''
      DefaultCacheBehavior:
        TargetOriginId: S3Origin
        ViewerProtocolPolicy: redirect-to-https
        # ... more config
```

### 3. Monitoring & Alerts

Add CloudWatch alarms:
- API 5xx error rate > 2%
- Lambda errors
- DynamoDB throttles
- SES bounce rate

### 4. Secrets Management

Move sensitive configs to AWS Secrets Manager:
- Database credentials (if RDS added later)
- Third-party API keys
- Encryption keys

## Phase 5: Additional Features (Low Priority)

### 1. Export Functionality

- CSV export for loads
- Date range filtering
- Custom column selection
- Email export option

### 2. Advanced Search

- Full-text search across loads
- Saved search filters
- Search history

### 3. Notifications

- Email notifications for status changes
- In-app notifications
- SMS alerts (optional)

### 4. Reporting Dashboard

- Analytics charts
- Performance metrics
- Driver leaderboard
- Monthly summaries

### 5. Mobile Native Apps

- React Native apps for iOS/Android
- Offline support with sync
- Push notifications
- Camera integration for photos

## Phase 6: Performance & Scale

### 1. Caching

- API Gateway caching for read operations
- ElastiCache for session data
- CloudFront caching for static assets

### 2. Database Optimization

- Review DynamoDB capacity settings
- Add indexes if needed
- Consider Aurora Serverless for complex queries

### 3. Lambda Optimization

- Provisioned concurrency for critical functions
- Function size optimization
- Connection pooling

## Quick Win Tasks

These can be done immediately:

1. **Add ESLint auto-fix** to package.json:
   ```json
   "lint:fix": "pnpm -r lint -- --fix"
   ```

2. **Add git hooks** with Husky:
   ```bash
   pnpm add -D husky lint-staged
   npx husky init
   ```

3. **Create pull request template**:
   `.github/pull_request_template.md`

4. **Add issue templates**:
   `.github/ISSUE_TEMPLATE/`

5. **Create CONTRIBUTING.md**:
   Guidelines for contributors

6. **Add Prettier check** to CI:
   ```yaml
   - name: Check formatting
     run: pnpm format -- --check
   ```

## Deployment Order

When ready to deploy:

1. Deploy infrastructure to dev
2. Create Cognito groups
3. Configure SES
4. Deploy API and Web to dev
5. Test thoroughly in dev
6. Deploy to prod (with approval)
7. Configure prod SES
8. Smoke test in prod

## Support & Maintenance

### Regular Tasks

- Review CloudWatch logs for errors
- Monitor AWS costs
- Update dependencies monthly
- Review and merge Dependabot PRs
- Backup DynamoDB (if not using PITR)

### Incident Response

1. Check CloudWatch alarms
2. Review Lambda logs
3. Check API Gateway metrics
4. Verify Cognito status
5. Check DynamoDB throttling

## Resources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## Timeline Estimate

- **Phase 1** (API Integration): 2-3 days
- **Phase 2** (Frontend UI): 5-7 days
- **Phase 3** (Testing): 3-4 days
- **Phase 4** (Production): 2-3 days
- **Total**: ~2-3 weeks for MVP

## Getting Help

- AWS Support for infrastructure issues
- GitHub Issues for bug reports
- Cognito documentation for auth issues
- React/Vite communities for frontend help

## Success Criteria

The application is ready for production when:

✅ All API endpoints are wired and functional
✅ Frontend UI is complete and polished
✅ Tests pass with >80% coverage
✅ E2E tests cover critical flows
✅ SES is configured for prod
✅ Monitoring and alerts are set up
✅ Documentation is complete
✅ Security review is passed
✅ Performance testing is done
✅ User acceptance testing is complete

---

**Remember**: Start with Phase 1 (API Gateway integration) as it's blocking for full end-to-end functionality. Then move to Phase 2 (Frontend UI) for user-facing features.
