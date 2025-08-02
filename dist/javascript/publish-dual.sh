#!/bin/bash
set -e

# Dual publishing script for npm and GitHub Packages
echo "🚀 Publishing to both npm and GitHub Packages..."

# Build the package
echo "📦 Building package..."
npm run build

# Backup original package.json
cp package.json package.json.backup

# Function to restore package.json on exit
cleanup() {
  echo "🔄 Restoring original package.json..."
  mv package.json.backup package.json
}
trap cleanup EXIT

# 1. Publish to npm (public registry)
echo "📤 Publishing to npm..."
npm publish --access public

# 2. Modify package.json for GitHub Packages
echo "🔧 Preparing for GitHub Packages..."
cat package.json | jq '.name = "@a0a7/fastgeotoolkit" | .publishConfig = {"registry": "https://npm.pkg.github.com", "access": "public"}' > package.json.tmp
mv package.json.tmp package.json

# 3. Publish to GitHub Packages
echo "📤 Publishing to GitHub Packages..."
npm publish

echo "✅ Successfully published to both registries!"
echo "📦 npm: https://www.npmjs.com/package/fastgeotoolkit"
echo "📦 GitHub: https://github.com/a0a7/fastgeotoolkit/packages"
