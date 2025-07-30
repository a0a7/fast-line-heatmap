#!/bin/bash
set -e

echo "Syncing packages..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"

# Check if core directory exists
if [ ! -d "$PROJECT_ROOT/core" ]; then
    echo -e "${RED}Error: core directory not found${NC}"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    echo -e "${RED}Error: dist directory not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Syncing Rust package...${NC}"
# Sync Rust package
if [ -d "$PROJECT_ROOT/dist/rust" ]; then
    # Copy source code
    cp -r "$PROJECT_ROOT/core/src" "$PROJECT_ROOT/dist/rust/"
    
    # Copy Cargo.toml but keep the package-specific configuration
    if [ -f "$PROJECT_ROOT/dist/rust/Cargo.toml" ]; then
        # Keep the existing package Cargo.toml (it has distribution-specific config)
        echo "  Keeping distribution Cargo.toml"
    else
        cp "$PROJECT_ROOT/core/Cargo.toml" "$PROJECT_ROOT/dist/rust/"
        echo "  Copied Cargo.toml"
    fi
    
    echo -e "${GREEN}  Rust package synced${NC}"
else
    echo -e "${RED}  dist/rust directory not found${NC}"
fi

echo -e "${YELLOW}Building WebAssembly for JavaScript package...${NC}"
# Build WASM for JavaScript package
if [ -d "$PROJECT_ROOT/dist/javascript" ]; then
    cd "$PROJECT_ROOT/core"
    
    # Check if wasm-pack is installed
    if command -v wasm-pack >/dev/null 2>&1; then
        # Build WASM
        wasm-pack build --target web --out-dir "../dist/javascript/wasm" --scope fastgeotoolkit
        echo -e "${GREEN}  WebAssembly built for JavaScript package${NC}"
    else
        echo -e "${RED}  wasm-pack not found. Install with: cargo install wasm-pack${NC}"
    fi
    
    cd "$PROJECT_ROOT"
else
    echo -e "${RED}  dist/javascript directory not found${NC}"
fi

echo -e "${YELLOW}Syncing Python package...${NC}"
# Sync Python package
if [ -d "$PROJECT_ROOT/dist/python" ]; then
    # Copy Rust source for Python compilation
    mkdir -p "$PROJECT_ROOT/dist/python/src"
    cp -r "$PROJECT_ROOT/core/src"/* "$PROJECT_ROOT/dist/python/src/"
    
    # Copy Cargo.toml for maturin, but adapt it for Python
    if [ ! -f "$PROJECT_ROOT/dist/python/Cargo.toml" ]; then
        cp "$PROJECT_ROOT/core/Cargo.toml" "$PROJECT_ROOT/dist/python/"
        echo "  Created Cargo.toml for Python package"
    fi
    
    echo -e "${GREEN}  Python package synced${NC}"
else
    echo -e "${RED}  dist/python directory not found${NC}"
fi

echo -e "${GREEN}Package sync complete!${NC}"

# Optional: Run basic tests
echo ""
read -p "Run tests for core implementation? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running Rust tests...${NC}"
    cd "$PROJECT_ROOT/core"
    cargo test
    echo -e "${GREEN}Tests completed${NC}"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Review changes in each package directory"
echo "  2. Update version numbers if needed: ./scripts/update_version.sh x.y.z"
echo "  3. Build and test each package individually"
echo "  4. Commit and tag for release"
