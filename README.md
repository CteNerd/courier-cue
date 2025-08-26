# Courier Cue

A serverless delivery management application built with AWS SAM, React PWA, and GitHub Actions CI/CD.

## 🏗️ Foundation Architecture

This is the **foundation deployment** - a minimal, deployable skeleton that establishes the infrastructure and deployment pipeline without business logic.

### Tech Stack
- **Frontend**: React + TypeScript PWA hosted on GitHub Pages
- **Backend**: API Gateway → Lambda (Node.js 20) via AWS SAM
- **Auth**: Cognito User Pool (email as username)
- **Data**: DynamoDB single-table design
- **Observability**: CloudWatch logs
- **CI/CD**: GitHub Actions with OIDC for AWS deployment

### Components
- ✅ React PWA with landing page and Cognito integration
- ✅ AWS Lambda health endpoint
- ✅ Cognito User Pool with groups (dispatcher, driver, admin)
- ✅ DynamoDB table (empty, ready for business logic)
- ✅ GitHub Actions workflows for automated deployment
- ✅ CORS-enabled API Gateway

## 🚀 One-Click Deployment

### Prerequisites
1. AWS Account with admin access
2. GitHub repository with Actions enabled
3. OIDC provider configured for GitHub Actions

### Setup AWS OIDC (One-time)
```bash
# Create OIDC provider and role (replace with your GitHub repo)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com

# Create deployment role with trust policy for your GitHub repo
# (See docs/aws-setup.md for detailed instructions)
```

### Repository Secrets
Add these secrets to your GitHub repository:
- `AWS_ROLE_TO_ASSUME`: ARN of the IAM role for GitHub Actions
- `AWS_REGION`: Your preferred AWS region (e.g., `us-east-1`)

### Deploy
1. **Push to main branch** - This triggers both backend and frontend deployments
2. **Backend deploys first** via AWS SAM
3. **Frontend builds** with environment variables from stack outputs
4. **GitHub Pages publishes** the PWA

### Access
- **App URL**: `https://YOUR_USERNAME.github.io/courier-cue`
- **API Health**: `{ApiUrl}/health`
- **Cognito Sign-in**: Available from the landing page

## 📁 Project Structure

```
├── .github/workflows/    # GitHub Actions CI/CD
│   ├── deploy-backend.yml
│   └── deploy-frontend.yml
├── src/handlers/         # Lambda functions
│   ├── health.js        # Health check endpoint
│   └── package.json
├── web/                 # React PWA
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/                # Documentation
├── template.yaml        # AWS SAM template
└── README.md
```

## 🔧 Local Development

### Backend (SAM Local)
```bash
# Install dependencies
cd src/handlers && npm install

# Start local API
sam local start-api --port 3000

# Test health endpoint
curl http://localhost:3000/health
```

### Frontend (Vite Dev Server)
```bash
# Install dependencies
cd web && npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Foundation Status

### ✅ Completed
- [x] Serverless infrastructure (SAM template)
- [x] Lambda health endpoint
- [x] Cognito User Pool with groups
- [x] DynamoDB table structure
- [x] React PWA scaffold
- [x] GitHub Actions CI/CD
- [x] CORS configuration
- [x] Environment variable management
- [x] GitHub Pages deployment

### 🚧 Next Steps (Business Logic Phase)
- [ ] Order management endpoints
- [ ] Driver tracking
- [ ] Real-time delivery updates
- [ ] Signature capture
- [ ] Admin dashboard
- [ ] User management interfaces

## 📖 Documentation

- [AWS Setup Guide](docs/aws-setup.md) - OIDC and IAM configuration
- [Development Guide](docs/development.md) - Local development setup
- [Deployment Guide](docs/deployment.md) - CI/CD pipeline details

## 🔒 Security

- No secrets committed to repository
- OIDC-based AWS authentication
- Cognito for user authentication
- CORS properly configured
- Environment-based configuration

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Status**: Foundation Phase ✅  
**Next**: Business Logic Implementation 🚧