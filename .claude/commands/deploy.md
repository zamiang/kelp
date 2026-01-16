---
allowed-tools: [Bash, Read]
description: Production deployment workflow for Kelp website and extension
approach: deployment-validation
token-cost: ~400
best-for: Production builds, pre-deployment checks, and release preparation
---

# Kelp Deployment Workflow

Complete production deployment process for both the Kelp website and Chrome extension.

## Your Task

Execute the full deployment workflow with validation:

```bash
#!/bin/bash

echo "🚀 Kelp Production Deployment"
echo "============================"
echo ""

# Pre-deployment health check
echo "🔍 Pre-deployment Health Check:"
echo "==============================="

# Check git status
echo "📋 Git Status:"
git status --porcelain | head -5
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory has uncommitted changes"
    echo "   Consider committing changes before deployment"
else
    echo "✅ Working directory clean"
fi
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Not on main branch - consider switching for production deployment"
fi
echo ""

# Run comprehensive tests
echo "🧪 Running Test Suite:"
echo "====================="
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed - deployment aborted"
    exit 1
fi
echo "✅ All tests passed"
echo ""

# Type checking
echo "🔍 TypeScript Validation:"
echo "========================"
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed - deployment aborted"
    exit 1
fi
echo "✅ Type checking passed"
echo ""

# Linting
echo "🔧 Code Quality Check:"
echo "====================="
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed - deployment aborted"
    exit 1
fi
echo "✅ Code quality checks passed"
echo ""

# Build website
echo "🌐 Building Website:"
echo "=================="
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Website build failed"
    exit 1
fi
echo "✅ Website build successful"
echo ""

# Check Next.js build output
if [ -d ".next" ]; then
    echo "📦 Website Build Analysis:"
    echo "========================="
    du -sh .next/
    echo "Static files: $(find .next/static -type f | wc -l | tr -d ' ') files"
    echo "Pages built: $(find .next/server/pages -name "*.js" | wc -l | tr -d ' ') pages"
fi
echo ""

# Build Chrome extension
echo "🔌 Building Chrome Extension:"
echo "============================"
npm run build-extension
if [ $? -ne 0 ]; then
    echo "❌ Extension build failed"
    exit 1
fi
echo "✅ Chrome extension build successful"
echo ""

# Validate extension build
if [ -d "extension/dist" ]; then
    echo "📦 Extension Build Analysis:"
    echo "============================"
    echo "Total size: $(du -sh extension/dist | cut -f1)"
    echo "Files created: $(find extension/dist -type f | wc -l | tr -d ' ') files"

    # Check critical files
    critical_files=("manifest.json" "background.js" "popup.js")
    for file in "${critical_files[@]}"; do
        if [ -f "extension/dist/$file" ]; then
            echo "✅ $file: $(du -h extension/dist/$file | cut -f1)"
        else
            echo "❌ Missing: $file"
        fi
    done
fi
echo ""

# Build Safari extension (if configured)
echo "🍎 Safari Extension:"
echo "==================="
if [ -d "extension/safari" ]; then
    echo "Building Safari extension..."
    npm run build-extension:safari
    if [ $? -eq 0 ]; then
        echo "✅ Safari extension build successful"
    else
        echo "❌ Safari extension build failed"
    fi
else
    echo "⚠️  Safari extension not configured"
fi
echo ""

# Security audit
echo "🔒 Security Audit:"
echo "================="
npm audit --audit-level=high --production
echo ""

# Dependency check
echo "📦 Dependency Analysis:"
echo "======================"
echo "Production dependencies: $(npm ls --production --depth=0 2>/dev/null | grep -E '^[├└]' | wc -l | tr -d ' ')"
echo "Development dependencies: $(npm ls --depth=0 2>/dev/null | grep -E '^[├└]' | grep -v production | wc -l | tr -d ' ')"
echo ""

# Bundle analysis (if available)
if [ -f ".next/analyze/client.html" ]; then
    echo "📊 Bundle Analysis Available:"
    echo "============================="
    echo "• Client bundle analysis: .next/analyze/client.html"
    echo "• Server bundle analysis: .next/analyze/server.html"
    echo ""
fi

echo "🎯 Deployment Summary:"
echo "====================="
echo "✅ All tests passed"
echo "✅ Type checking completed"
echo "✅ Code quality validated"
echo "✅ Website build successful"
echo "✅ Extension build successful"
echo ""

echo "📋 Deployment Checklist:"
echo "========================"
echo "□ Review build outputs for size/performance"
echo "□ Test website locally: npm start"
echo "□ Test extension in Chrome before publishing"
echo "□ Update version numbers if needed"
echo "□ Create git tag for release"
echo "□ Deploy website to production"
echo "□ Submit extension to Chrome Web Store"
echo ""

echo "🌐 Website Deployment:"
echo "====================="
echo "• Next.js build ready in .next/ directory"
echo "• Deploy command: npm start (or deploy to Vercel/hosting platform)"
echo ""

echo "🔌 Extension Deployment:"
echo "======================="
echo "• Extension package ready in extension/dist/ directory"
echo "• Zip extension/dist/ contents for Chrome Web Store"
echo "• Safari extension ready in extension/safari/ (if configured)"
echo ""

echo "🚀 Deployment preparation complete!"
```

## Production Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Version numbers updated
- [ ] Environment variables configured
- [ ] API credentials valid

### Website Deployment

- [ ] Next.js build optimized
- [ ] Static assets properly referenced
- [ ] Environment variables set in production
- [ ] Database connections configured
- [ ] Domain and SSL configured

### Extension Deployment

- [ ] Manifest version updated
- [ ] All permissions justified
- [ ] Extension tested in clean Chrome profile
- [ ] Screenshots and store listing updated
- [ ] Privacy policy and terms updated

### Post-Deployment

- [ ] Smoke tests on production
- [ ] Monitor error logs
- [ ] Verify analytics tracking
- [ ] Update documentation
- [ ] Create release notes

## Notes

This deployment workflow ensures comprehensive validation before production release. Both the website and extension are built and validated for production readiness.
