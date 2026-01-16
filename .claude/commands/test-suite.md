---
allowed-tools: [Bash]
description: Comprehensive testing suite for Kelp project with coverage analysis
approach: progressive-testing
token-cost: ~200
best-for: Running comprehensive tests and analyzing coverage
---

# Kelp Test Suite

Comprehensive testing and coverage analysis for the Kelp project.

## Your Task

Run the complete test suite with detailed analysis:

```bash
#!/bin/bash

echo "🧪 Kelp Test Suite Analysis"
echo "=========================="
echo ""

# Run tests with coverage
echo "📊 Running tests with coverage analysis..."
npm run test:coverage
echo ""

# Display coverage summary
if [ -f "coverage/coverage-summary.json" ]; then
    echo "📈 Coverage Summary:"
    echo "==================="
    # Parse and display coverage summary in a readable format
    node -e "
    const fs = require('fs');
    const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
    console.log('Lines:      ' + summary.total.lines.pct + '%');
    console.log('Functions:  ' + summary.total.functions.pct + '%');
    console.log('Branches:   ' + summary.total.branches.pct + '%');
    console.log('Statements: ' + summary.total.statements.pct + '%');
    console.log('');

    // Check if coverage meets thresholds
    const thresholds = { lines: 70, functions: 60, branches: 60, statements: 70 };
    let allPassed = true;

    Object.entries(thresholds).forEach(([key, threshold]) => {
        const actual = summary.total[key].pct;
        const status = actual >= threshold ? '✅' : '❌';
        const statusText = actual >= threshold ? 'PASS' : 'FAIL';
        console.log(\`\${status} \${key.padEnd(10)} \${actual}% (threshold: \${threshold}%) - \${statusText}\`);
        if (actual < threshold) allPassed = false;
    });

    console.log('');
    console.log(allPassed ? '✅ All coverage thresholds met!' : '❌ Some coverage thresholds not met');
    "
else
    echo "⚠️  Coverage report not found"
fi
echo ""

# Check test file structure
echo "📁 Test File Analysis:"
echo "====================="
find test/ -name "*.test.ts" -o -name "*.test.tsx" | wc -l | xargs echo "Test files found:"
find test/ -name "*.test.ts" -o -name "*.test.tsx" | head -10
echo ""

# Check for test patterns in components
echo "🔍 Component Test Coverage:"
echo "=========================="
echo "Components with tests:"
find extension/src/components -name "*.tsx" | while read component; do
    basename=$(basename "$component" .tsx)
    if find test/ -name "*$basename*test*" | grep -q .; then
        echo "✅ $(dirname "$component" | sed 's|extension/src/components/||')/$(basename "$component")"
    fi
done
echo ""

echo "Components without tests:"
find extension/src/components -name "*.tsx" | while read component; do
    basename=$(basename "$component" .tsx)
    if ! find test/ -name "*$basename*test*" | grep -q .; then
        echo "❌ $(dirname "$component" | sed 's|extension/src/components/||')/$(basename "$component")"
    fi
done
echo ""

# Show recent test results
echo "📋 Quick Test Status:"
echo "===================="
npm test -- --reporter=verbose --run | tail -20
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo "• Open coverage report: open coverage/index.html"
echo "• Run tests with UI: npm run test:ui"
echo "• Focus on low-coverage files to improve overall coverage"
echo "• Add tests for components marked as ❌ above"
```

## Coverage Targets

- **Lines**: 70% minimum
- **Functions**: 60% minimum
- **Branches**: 60% minimum
- **Statements**: 70% minimum

## Test Categories

1. **Unit Tests**: Individual functions and utilities
2. **Component Tests**: React component behavior
3. **Integration Tests**: Store and data flow
4. **Extension Tests**: Chrome extension functionality

## Notes

This command provides comprehensive test analysis including coverage metrics, test file mapping, and recommendations for improving test coverage.
