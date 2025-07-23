# Multi-Language Package Build Configuration

This document describes the build process for fastGeoToolkit across multiple programming languages.

## Package Structure

```
fastgeotoolkit/
├── core/         # Main development core (Rust)
├── packages/
│   ├── rust/             # Distribution-ready Rust crate
│   ├── javascript/       # JavaScript/TypeScript package for NPM
│   ├── python/          # Python package for PyPI
│   └── r/              # R package for CRAN
├── demo/                 # Web demonstration
└── docs/                # Shared documentation
```

### Directory Roles

- **`core/`**: Core development workspace with latest code
- **`packages/rust/`**: Clean, distribution-ready Rust crate
- **`packages/javascript/`**: NPM package with WASM bindings
- **`packages/python/`**: Python package with Rust extensions
- **`packages/r/`**: R package with Rust integration

## Build Process

### Development Workflow

1. **Develop in `core/`**: Make all core changes here
2. **Sync to packages**: Copy/generate package-specific files
3. **Build packages**: Create distribution-ready versions
4. **Test all packages**: Ensure consistency across languages
5. **Publish**: Deploy to respective package managers

### 0. Sync Development to Packages

Before building, sync the latest code:

```bash
# Copy core Rust library to packages/rust/
cp -r core/src packages/rust/src
cp core/Cargo.toml packages/rust/Cargo.toml

# Update version numbers across all packages
./scripts/update_version.sh 0.1.4

# Generate WASM for JavaScript package
cd core
wasm-pack build --target web --out-dir ../packages/javascript/wasm
```

### 1. Rust Package (crates.io)

```bash
cd packages/rust
cargo build --release
cargo test
cargo publish --dry-run
cargo publish
```

### 2. JavaScript/TypeScript Package (NPM)

```bash
cd packages/javascript

# Build WebAssembly module
cd ../../core
wasm-pack build --target web --out-dir ../packages/javascript/wasm

# Build JavaScript package
cd ../packages/javascript
npm install
npm run build
npm test
npm publish
```

### 3. Python Package (PyPI)

```bash
cd packages/python

# Install maturin if not already installed
pip install maturin

# Build Python extension
maturin develop
maturin build --release

# Test the package
python -m pytest tests/

# Publish to PyPI
maturin publish
```

### 4. R Package (CRAN)

```bash
cd packages/r

# Build and check package
R CMD build .
R CMD check fastgeotoolkit_0.1.3.tar.gz

# Install locally for testing
R CMD INSTALL fastgeotoolkit_0.1.3.tar.gz

# Submit to CRAN (manual process)
```

## Development Workflow

### Setting Up Development Environment

1. **Rust**: Install Rust toolchain and wasm-pack
2. **JavaScript**: Install Node.js and npm/yarn
3. **Python**: Install Python 3.8+ and maturin
4. **R**: Install R 4.0+ and development tools

### Making Changes

1. **Develop in `core/`**: All core algorithm development happens here
2. **Test locally**: Use `cargo test` and `wasm-pack build` in core
3. **Sync to packages**: Copy changes to language-specific package directories
4. **Update version numbers**: Synchronize versions across all package manifests
5. **Rebuild all packages**: Generate fresh builds for each language
6. **Run tests**: Ensure consistency across all implementations
7. **Update documentation**: Keep README files and examples current

### Testing

Each package includes its own test suite:

- **Rust**: `cargo test`
- **JavaScript**: `npm test`
- **Python**: `pytest`
- **R**: `R CMD check`

### Publishing

Packages should be published in this order:
1. Rust (foundation)
2. JavaScript (WASM dependency)
3. Python (may depend on Rust crate)
4. R (independent)

## Recommended Actions for core Directory

### Current State
Your `core/` directory contains:
- Complete Rust implementation with all algorithms
- WebAssembly bindings and build configuration
- Tests and documentation
- Package metadata (Cargo.toml, package.json)

### Recommended Organization

1. **Keep as Development Core**: Continue using `core/` for development
2. **Create Sync Scripts**: Automate copying to package directories
3. **Maintain Single Source**: Use `core/src/lib.rs` as the authoritative implementation

### Immediate Steps

```bash
# 1. Create sync script
touch scripts/sync_packages.sh
chmod +x scripts/sync_packages.sh

# 2. Copy current implementation to packages/rust
cp -r core/src packages/rust/
cp core/Cargo.toml packages/rust/Cargo.toml

# 3. Build WASM for JavaScript
cd core
wasm-pack build --target web --out-dir ../packages/javascript/wasm

# 4. Test current implementation
cargo test
wasm-pack test --headless --firefox
```

## CI/CD Pipeline

The automated build pipeline should:

1. Run all tests on multiple platforms
2. Build packages for all languages
3. Generate documentation
4. Deploy to package repositories on release tags

## Version Management

All packages should maintain synchronized version numbers:
- Major.Minor.Patch format
- Update all package.json, Cargo.toml, pyproject.toml, and DESCRIPTION files
- Tag releases in git with format `v0.1.3`

## Documentation

Each package maintains its own README with language-specific examples and installation instructions, while sharing core algorithmic documentation.
