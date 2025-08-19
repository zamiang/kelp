---
allowed-tools: [Bash, LS, Read]
description: Chrome extension development workflow for Kelp
approach: extension-focused
token-cost: ~250
best-for: Extension development, debugging, and deployment
---

# Kelp Extension Development

Specialized workflow for Chrome extension development and debugging.

## Your Task

Manage the complete extension development lifecycle:

```bash
#!/bin/bash

echo "🔌 Kelp Extension Development Workflow"
echo "====================================="
echo ""

# Check current extension structure
echo "📁 Extension Structure:"
echo "======================"
if [ -d "extension/src" ]; then
    echo "✅ Source directory exists"
    echo "Components: $(find extension/src/components -name "*.tsx" | wc -l | tr -d ' ') files"
    echo "Styles: $(find extension/src/styles -name "*.css" | wc -l | tr -d ' ') files"
    echo "Utils: $(find extension/src -name "*.ts" -not -path "*/components/*" | wc -l | tr -d ' ') files"
else
    echo "❌ Extension source directory not found"
    exit 1
fi
echo ""

# Build extension for development
echo "🔨 Building Extension (Development):"
echo "=================================="
npm run dev:extension &
DEV_PID=$!
sleep 5
kill $DEV_PID 2>/dev/null || true
echo ""

# Check build output
echo "📦 Build Output Analysis:"
echo "========================"
if [ -d "extension/dist" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "Generated files:"
    ls -la extension/dist/ | grep -E '\.(js|css|html|json)$' | head -10
    echo ""

    # Check manifest
    if [ -f "extension/dist/manifest.json" ]; then
        echo "📋 Manifest Analysis:"
        echo "===================="
        echo "Manifest version: $(cat extension/dist/manifest.json | grep -o '"manifest_version":[[:space:]]*[0-9]*' | grep -o '[0-9]*')"
        echo "Extension name: $(cat extension/dist/manifest.json | grep -o '"name":[[:space:]]*"[^"]*"' | cut -d'"' -f4)"
        echo "Permissions: $(cat extension/dist/manifest.json | grep -A 20 '"permissions"' | grep -o '"[^"]*"' | wc -l | tr -d ' ') declared"
    fi
else
    echo "❌ Build failed - no dist directory found"
    echo ""
    echo "Trying production build..."
    npm run build-extension
fi
echo ""

# Check for common extension issues
echo "🔍 Extension Health Check:"
echo "========================="

# Check for background script
if [ -f "extension/dist/background.js" ]; then
    echo "✅ Background script exists"
    echo "   Size: $(du -h extension/dist/background.js | cut -f1)"
else
    echo "❌ Background script missing"
fi

# Check for popup/dashboard
if [ -f "extension/dist/popup.js" ]; then
    echo "✅ Popup script exists"
    echo "   Size: $(du -h extension/dist/popup.js | cut -f1)"
else
    echo "❌ Popup script missing"
fi

# Check for content scripts
if find extension/dist -name "*content*" | grep -q .; then
    echo "✅ Content scripts found"
else
    echo "⚠️  No content scripts detected"
fi

# Check for assets
if [ -d "extension/dist" ] && [ "$(ls extension/dist/*.png 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "✅ Extension icons present"
else
    echo "❌ Extension icons missing"
fi
echo ""

# Safari build check (if applicable)
echo "🍎 Safari Extension:"
echo "==================="
if [ -d "extension/safari" ]; then
    echo "✅ Safari version available"
    echo "To build: npm run build-extension:safari"
else
    echo "⚠️  Safari version not configured"
fi
echo ""

# Development tips
echo "💡 Development Tips:"
echo "==================="
echo "1. Load extension in Chrome:"
echo "   • Go to chrome://extensions/"
echo "   • Enable Developer mode"
echo "   • Click 'Load unpacked'"
echo "   • Select the extension/dist/ folder"
echo ""
echo "2. Debug extension:"
echo "   • Right-click extension icon → Inspect popup"
echo "   • Check chrome://extensions/ for errors"
echo "   • Use Chrome DevTools for content scripts"
echo ""
echo "3. Watch mode for development:"
echo "   • Run: npm run dev:extension"
echo "   • Reload extension after code changes"
echo ""
echo "4. Production build:"
echo "   • Run: npm run build-extension"
echo "   • Test thoroughly before distribution"

# Check Chrome extension permissions
if [ -f "extension/dist/manifest.json" ]; then
    echo ""
    echo "🔐 Permissions Summary:"
    echo "======================"
    grep -A 50 '"permissions"' extension/dist/manifest.json | grep '"[^"]*"' | sed 's/.*"\([^"]*\)".*/• \1/' | head -20
fi

echo ""
echo "🚀 Extension development environment ready!"
```

## Extension Architecture

The Kelp extension consists of:

- **Background scripts**: API integration, data synchronization
- **Content scripts**: Web page interaction and data extraction
- **Popup/Dashboard**: User interface components
- **Storage**: IndexedDB for local data management

## Key APIs Used

- Chrome Extension APIs (storage, tabs, history)
- Google APIs (Calendar, Drive, Contacts)
- Microsoft Graph API
- Custom web scraping and data extraction

## Development Workflow

1. Start development build: `npm run dev:extension`
2. Load extension in Chrome for testing
3. Make code changes and rebuild
4. Test functionality and debug issues
5. Build production version: `npm run build-extension`

## Notes

The extension integrates deeply with Google and Microsoft services, requiring proper OAuth setup and API credentials for full functionality.
