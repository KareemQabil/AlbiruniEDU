#!/bin/bash

# Al-Biruni EDU - Vercel Deployment Script
# This script automates the deployment to Vercel

set -e  # Exit on error

echo "🚀 Al-Biruni EDU - Vercel Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"
echo ""

# Check if logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please log in to Vercel:"
    vercel login
fi

echo -e "${GREEN}✅ Logged in to Vercel${NC}"
echo ""

# Build check
echo "Running build check..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo ""

# TypeScript check
echo "Running TypeScript check..."
npm run typecheck || true

echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""

# Ask for deployment type
read -p "Deploy to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to PRODUCTION..."
    vercel --prod
else
    echo "Deploying to PREVIEW..."
    vercel
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Check the deployment URL provided above"
echo "2. Test the application thoroughly"
echo "3. Update Supabase redirect URLs if needed"
echo "4. Configure custom domain (optional)"
echo ""
echo "For more information, see DEPLOYMENT.md"
