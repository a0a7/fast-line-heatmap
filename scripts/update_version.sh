#!/bin/bash
set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 0.1.4"
    exit 1
fi

NEW_VERSION="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Updating fastGeoToolkit to version $NEW_VERSION..."

# Update Rust packages
echo "Updating Rust package versions..."

# Update main core Cargo.toml
if [ -f "$PROJECT_ROOT/core/Cargo.toml" ]; then
    # Use awk to update only the version in the [package] section
    awk -v new_version="$NEW_VERSION" '
        /^\[package\]/ { in_package = 1 }
        /^\[/ && !/^\[package\]/ { in_package = 0 }
        in_package && /^version = / { $0 = "version = \"" new_version "\"" }
        { print }
    ' "$PROJECT_ROOT/core/Cargo.toml" > "$PROJECT_ROOT/core/Cargo.toml.tmp" && mv "$PROJECT_ROOT/core/Cargo.toml.tmp" "$PROJECT_ROOT/core/Cargo.toml"
    echo "  Updated core/Cargo.toml"
fi

# Update dist/rust Cargo.toml
if [ -f "$PROJECT_ROOT/dist/rust/Cargo.toml" ]; then
    # Use awk to update only the version in the [package] section
    awk -v new_version="$NEW_VERSION" '
        /^\[package\]/ { in_package = 1 }
        /^\[/ && !/^\[package\]/ { in_package = 0 }
        in_package && /^version = / { $0 = "version = \"" new_version "\"" }
        { print }
    ' "$PROJECT_ROOT/dist/rust/Cargo.toml" > "$PROJECT_ROOT/dist/rust/Cargo.toml.tmp" && mv "$PROJECT_ROOT/dist/rust/Cargo.toml.tmp" "$PROJECT_ROOT/dist/rust/Cargo.toml"
    echo "  Updated dist/rust/Cargo.toml"
fi

# Update dist/python Cargo.toml
if [ -f "$PROJECT_ROOT/dist/python/Cargo.toml" ]; then
    # Use awk to update only the version in the [package] section
    awk -v new_version="$NEW_VERSION" '
        /^\[package\]/ { in_package = 1 }
        /^\[/ && !/^\[package\]/ { in_package = 0 }
        in_package && /^version = / { $0 = "version = \"" new_version "\"" }
        { print }
    ' "$PROJECT_ROOT/dist/python/Cargo.toml" > "$PROJECT_ROOT/dist/python/Cargo.toml.tmp" && mv "$PROJECT_ROOT/dist/python/Cargo.toml.tmp" "$PROJECT_ROOT/dist/python/Cargo.toml"
    echo "  Updated dist/python/Cargo.toml"
fi

# Update JavaScript package.json files
echo "🌐 Updating JavaScript package versions..."

# Update main package.json
if [ -f "$PROJECT_ROOT/core/package.json" ]; then
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$PROJECT_ROOT/core/package.json"
    echo "  Updated core/package.json"
fi

# Update dist/javascript package.json
if [ -f "$PROJECT_ROOT/dist/javascript/package.json" ]; then
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$PROJECT_ROOT/dist/javascript/package.json"
    echo "  Updated dist/javascript/package.json"
fi

# Update Python package
echo "🐍 Updating Python package version..."

if [ -f "$PROJECT_ROOT/dist/python/pyproject.toml" ]; then
    # Use awk to update only the version in the [project] section
    awk -v new_version="$NEW_VERSION" '
        /^\[project\]/ { in_project = 1 }
        /^\[/ && !/^\[project\]/ { in_project = 0 }
        in_project && /^version = / { $0 = "version = \"" new_version "\"" }
        { print }
    ' "$PROJECT_ROOT/dist/python/pyproject.toml" > "$PROJECT_ROOT/dist/python/pyproject.toml.tmp" && mv "$PROJECT_ROOT/dist/python/pyproject.toml.tmp" "$PROJECT_ROOT/dist/python/pyproject.toml"
    echo "  Updated dist/python/pyproject.toml"
fi

# Update Python __init__.py
if [ -f "$PROJECT_ROOT/dist/python/python/fastgeotoolkit/__init__.py" ]; then
    sed -i.bak "s/__version__ = \".*\"/__version__ = \"$NEW_VERSION\"/" "$PROJECT_ROOT/dist/python/python/fastgeotoolkit/__init__.py"
    echo "  Updated dist/python/__init__.py"
fi

# Update demo package.json
echo "Updating demo version..."

if [ -f "$PROJECT_ROOT/demo/package.json" ]; then
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$PROJECT_ROOT/demo/package.json"
    echo "  Updated demo/package.json"
fi

# Clean up backup files
echo "Cleaning up backup files..."
find "$PROJECT_ROOT" -name "*.bak" -delete

echo "Version update complete!"
echo ""
echo "Updated files:"
echo "  - core/Cargo.toml"
echo "  - core/package.json"
echo "  - dist/rust/Cargo.toml"
echo "  - dist/python/Cargo.toml"
echo "  - dist/javascript/package.json"
echo "  - dist/python/pyproject.toml"
echo "  - dist/python/__init__.py"
echo "  - demo/package.json"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Test all packages: ./scripts/sync_packages.sh"
echo "  3. Commit changes: git add . && git commit -m 'Bump version to $NEW_VERSION'"
echo "  4. Tag release: git tag v$NEW_VERSION"
