---
allowed-tools: [Bash, Read, LS]
description: Complete Kelp development environment setup and health check
approach: sequential-validation
token-cost: ~300
best-for: Setting up development environment or debugging setup issues
---

# Kelp Development Setup

Comprehensive development environment setup and validation for the Kelp project.

## Your Task

Set up and validate the complete development environment:

```bash
#!/bin/bash

echo "🌊 Kelp Development Environment Setup"
echo "===================================="
echo ""

# Check Node.js version (requires 22+)
echo "📦 Checking Node.js version..."
node --version
npm --version
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Type check the project
echo "🔍 Running TypeScript type check..."
npm run typecheck
echo ""

# Run linting
echo "🔧 Running ESLint..."
npm run lint
echo ""

# Run tests to ensure everything works
echo "🧪 Running test suite..."
npm test
echo ""

# Check if extension builds successfully
echo "🔨 Building Chrome extension..."
npm run build-extension
echo ""

# Verify build artifacts exist
if [ -d "extension/dist" ]; then
    echo "✅ Extension build successful - files created in extension/dist/"
    ls -la extension/dist/
else
    echo "❌ Extension build failed - no dist directory found"
fi
echo ""

echo "🚀 Development environment ready!"
echo ""
echo "Next steps:"
echo "  1. Start website dev server:    npm run dev"
echo "  2. Start extension dev mode:    npm run dev:extension"
echo "  3. Load extension in Chrome from extension/dist/"
echo ""
echo "Optional commands:"
echo "  npm run test:ui              - Run tests with UI"
echo "  npm run css:analyze          - Analyze CSS usage"
echo "  npm run lint:exports         - Check for unused exports"
```

## Troubleshooting

If setup fails:

1. **Node.js version**: Ensure Node.js 22+ is installed
2. **Dependencies**: Try `rm -rf node_modules package-lock.json && npm install`
3. **TypeScript**: Check tsconfig.json for any path resolution issues
4. **Extension build**: Verify webpack configuration in extension/webpack.config.js

## Notes

This command validates the entire development stack and ensures all tools are working correctly before development begins.
