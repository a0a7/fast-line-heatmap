# fast-line-heatmap

![Tests](https://img.shields.io/badge/tests-%2F_passed-brightgreen)
![Rust](https://img.shields.io/badge/rust-stable-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

GPS track processor for frequency-based route heatmaps from GPX, FIT, and polyline data.

## Features

- GPX file parsing
- FIT file parsing  
- Polyline decoding
- Route frequency analysis
- WebAssembly bindings

## Usage

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
import init, { process_gpx_files, decode_polyline_string } from 'heatmap-parse';

await init();

const files = [/* Uint8Array buffers */];
const result = process_gpx_files(files);

const coords = decode_polyline_string("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
```

## Testing

The project includes comprehensive test coverage with 56 tests covering:

- **Core Functionality**: Polyline processing, heatmap generation, file parsing
- **Geospatial Operations**: Distance calculations, intersections, coverage analysis  
- **Data Processing**: GPS error handling, coordinate validation, track manipulation
- **Format Support**: GPX, FIT, GeoJSON, polyline encoding/decoding
- **Performance**: Large dataset handling (10,000+ points)
- **Edge Cases**: Boundary values, NaN/Infinity handling, precision testing

```bash
# Run all tests
cd core && cargo test

# Run specific test suite
cargo test comprehensive_functionality_tests

# Run with output
cargo test -- --nocapture
```

## Building

```bash
# Native Rust
cargo build --release

# WebAssembly
wasm-pack build --target web
```

## License

MIT
