#!/bin/bash

# Performance metrics report script

echo "📊 Performance Report"
echo "====================="

# Check bundle sizes
echo ""
echo "📦 Bundle Sizes:"
echo "----------------"
if [ -d "dist" ]; then
    du -h dist/*.js 2>/dev/null || echo "No JS bundles found"
    echo ""
    echo "Total dist size: $(du -sh dist/ | cut -f1)"
else
    echo "No dist directory found. Run 'npm run build' first."
fi

# Check dependencies size
echo ""
echo "📚 Dependencies:"
echo "----------------"
if [ -d "node_modules" ]; then
    echo "node_modules size: $(du -sh node_modules/ | cut -f1)"
    echo "Number of packages: $(ls node_modules/ | wc -l)"
else
    echo "No node_modules found"
fi

# Check test coverage if available
echo ""
echo "🧪 Test Coverage:"
echo "----------------"
if [ -d "coverage" ]; then
    if [ -f "coverage/coverage-summary.json" ]; then
        echo "Coverage data available in coverage/"
    else
        echo "Run 'npm run test:coverage' to generate coverage report"
    fi
else
    echo "No coverage data. Run 'npm run test:coverage'"
fi

# Memory and startup time would require running the app
echo ""
echo "💡 To measure runtime performance:"
echo "   - Run the app and check Task Manager/Activity Monitor"
echo "   - Target: < 200MB memory usage"
echo "   - Target: < 3s startup time"
