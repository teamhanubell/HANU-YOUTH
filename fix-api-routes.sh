#!/bin/bash

# Script to fix all API routes for static export

echo "🔧 Fixing API routes for static export..."

# Add static export configuration to all API route files
find src/app/api -name "route.ts" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Check if file already has the static export configuration
    if ! grep -q "export const dynamic.*force-static" "$file"; then
        # Add the static export configuration after the imports
        sed -i '/^import.*$/a\\n// Force static export for this route\nexport const dynamic = "force-static"\n' "$file"
        echo "  ✓ Added static export configuration"
    else
        echo "  ✓ Already has static export configuration"
    fi
done

echo "✅ All API routes fixed for static export!"