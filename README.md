# fastgeotoolkit [![Crates.io](https://img.shields.io/crates/v/fastgeotoolkit)](https://crates.io/crates/fastgeotoolkit) [![PyPI](https://img.shields.io/pypi/v/fastgeotoolkit)](https://pypi.org/project/fastgeotoolkit/) [![npm](https://img.shields.io/npm/v/fastgeotoolkit)](https://www.npmjs.com/package/fastgeotoolkit)

[![codecov](https://codecov.io/gh/a0a7/fastgeotoolkit/branch/main/graph/badge.svg)](https://codecov.io/gh/a0a7/fastgeotoolkit)
[![Rust Tests](https://github.com/a0a7/fastgeotoolkit/actions/workflows/rust-tests.yml/badge.svg)](https://github.com/a0a7/fastgeotoolkit/actions/workflows/rust-tests.yml)
[![JavaScript Tests](https://github.com/a0a7/fastgeotoolkit/actions/workflows/javascript-tests.yml/badge.svg)](https://github.com/a0a7/fastgeotoolkit/actions/workflows/javascript-tests.yml)
[![CodeQL](https://github.com/a0a7/fastgeotoolkit/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/a0a7/fastgeotoolkit/actions/workflows/github-code-scanning/codeql)
![License](https://img.shields.io/badge/license-MIT-blue)

GPS track processor for frequency-based route heatmaps from GPX, FIT, and polyline data.

## Installation

| Language | Package Manager | Command |
|----------|----------------|---------|
| **Rust** | cargo | `cargo add fastgeotoolkit` |
| **Python** | pip | `pip install fastgeotoolkit` |
| **JavaScript/Node.js** | npm | `npm install fastgeotoolkit` |
| **JavaScript/Node.js** | GitHub Packages | `npm install @a0a7/fastgeotoolkit` |

> **Note**: The JavaScript package is available on both npm and GitHub Packages with the same functionality.

## Features

- GPX file parsing
- FIT file parsing  
- Polyline decoding
- Route frequency analysis
- WebAssembly bindings

## Docs

**[full docs](https://a0a7.github.io/fastgeotoolkit/)**

- [Rust API](https://docs.rs/fastgeotoolkit)
- [JS/TS API](https://a0a7.github.io/fastgeotoolkit/api/typescript)
- [Python API](https://a0a7.github.io/fastgeotoolkit/api/python)

## Installation

### JavaScript/TypeScript

```bash
# Install from npm (latest version)
npm install fastgeotoolkit

# Or install from GitHub Packages
npm install @a0a7/fastgeotoolkit --registry=https://npm.pkg.github.com
```

### Rust

```toml
# Add to Cargo.toml
[dependencies]
fastgeotoolkit = "0.1.0"
```

### Python

```bash
pip install fastgeotoolkit
```

## Example Usage

### JavaScript/TypeScript

```javascript
import { processGpxFiles, decodePolyline } from 'fastgeotoolkit';

// Process GPX files
const gpxFiles = [/* ArrayBuffer[] */];
const result = await processGpxFiles(gpxFiles);

// Decode polyline
const decoded = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
```

### Rust

```rust
use heatmap_parse::{process_gpx_files, decode_polyline, process_polylines};

let files = vec![/* Vec<u8> file data */];
let result = process_gpx_files(files);

let coords = decode_polyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

let polylines = vec!["polyline1".to_string(), "polyline2".to_string()];
let tracks = process_polylines(polylines);
```

### WebAssembly

```javascript
import init, { process_gpx_files, decode_polyline_string } from 'fastgeotoolkit';

await init();

const files = [/* Uint8Array buffers */];
const result = process_gpx_files(files);

const coords = decode_polyline_string("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
```

## Building

```bash
# Native Rust
cargo build --release

# js
wasm-pack build --target web
```

## License

MIT