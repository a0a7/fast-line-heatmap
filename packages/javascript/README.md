# fastGeoToolkit JavaScript/TypeScript

[![npm](https://img.shields.io/npm/v/fastgeotoolkit.svg)](https://www.npmjs.com/package/fastgeotoolkit)
[![npm downloads](https://img.shields.io/npm/dm/fastgeotoolkit.svg)](https://www.npmjs.com/package/fastgeotoolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A novel high-performance geospatial analysis framework with advanced route density mapping algorithms, compiled to WebAssembly for maximum performance in JavaScript/TypeScript applications.

## Installation

```bash
npm install fastgeotoolkit
# or
yarn add fastgeotoolkit
# or
pnpm add fastgeotoolkit
```

## Quick Start

### ES Modules (Recommended)

```typescript
import { 
  init, 
  processGpxFiles, 
  decodePolyline, 
  calculateTrackStatistics,
  type HeatmapResult,
  type Coordinate 
} from 'fastgeotoolkit';

// Initialize WebAssembly module
await init();

// Process GPX files
const gpxData = new Uint8Array(/* your GPX file data */);
const heatmap: HeatmapResult = await processGpxFiles([gpxData]);

// Decode polylines
const coords: Coordinate[] = await decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');

// Calculate statistics
const stats = await calculateTrackStatistics(coords);
console.log(`Distance: ${stats.distance_km.toFixed(2)} km`);
```

### CommonJS

```javascript
const { init, processGpxFiles, decodePolyline } = require('fastgeotoolkit');

async function example() {
  await init();
  
  const coords = await decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
  console.log('Decoded coordinates:', coords);
}
```

### Browser (CDN)

```html
<script type="module">
  import { init, decodePolyline } from 'https://unpkg.com/fastgeotoolkit@latest/dist/index.esm.js';
  
  await init();
  const coords = await decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
  console.log(coords);
</script>
```

## Core Features

### Route Density Mapping

Generate heatmaps with frequency analysis for route popularity visualization:

```typescript
import { processGpxFiles, type HeatmapResult } from 'fastgeotoolkit';

const files = [gpxFile1, gpxFile2, gpxFile3]; // Uint8Array[]
const heatmap: HeatmapResult = await processGpxFiles(files);

// Access frequency-weighted tracks
heatmap.tracks.forEach((track, index) => {
  console.log(`Track ${index}: ${track.frequency}x frequency, ${track.coordinates.length} points`);
});

console.log(`Maximum frequency: ${heatmap.max_frequency}`);
```

### 📍 Multi-Format GPS Processing

Support for GPX, FIT, and polyline formats:

```typescript
import { processGpxFiles, processPolylines, decodePolyline } from 'fastgeotoolkit';

// GPX files
const gpxResult = await processGpxFiles([gpxData]);

// Multiple polylines
const polylines = ['polyline1', 'polyline2', 'polyline3'];
const polylineResult = await processPolylines(polylines);

// Single polyline
const coordinates = await decodePolyline('encoded_polyline_string');
```

### Track Analysis

Comprehensive geospatial analysis functions:

```typescript
import { 
  calculateTrackStatistics, 
  findTrackIntersections, 
  validateCoordinates 
} from 'fastgeotoolkit';

// Track statistics
const stats = await calculateTrackStatistics(coordinates);
console.log(`Distance: ${stats.distance_km} km`);
console.log(`Bounding box: ${stats.bounding_box}`);

// Find intersections
const tracks = [track1, track2, track3];
const intersections = await findTrackIntersections(tracks, 0.001); // 100m tolerance

// Validate coordinates
const validation = await validateCoordinates(coordinates);
console.log(`Valid: ${validation.valid_count}/${validation.total_count}`);
```

### Data Conversion

Convert between different geospatial formats:

```typescript
import { coordinatesToGeojson, exportToGpx } from 'fastgeotoolkit';

// Convert to GeoJSON
const geojson = await coordinatesToGeojson(coordinates, {
  name: 'My Route',
  sport: 'cycling'
});

// Export to GPX
const gpxString = await exportToGpx([track1, track2], {
  creator: 'fastGeoToolkit',
  version: '1.1'
});
```

## API Reference

### Initialization

- `init()` - Initialize WebAssembly module (required before other functions)

### Processing Functions

- `processGpxFiles(files: Uint8Array[])` - Process GPX files into heatmap
- `processPolylines(polylines: string[])` - Process polyline data into heatmap
- `decodePolyline(encoded: string)` - Decode single polyline to coordinates

### Analysis Functions

- `calculateTrackStatistics(coords: Coordinate[])` - Calculate distance, bounds, etc.
- `findTrackIntersections(tracks: Coordinate[][], tolerance: number)` - Find intersection points
- `validateCoordinates(coords: Coordinate[])` - Validate GPS coordinates
- `calculateCoverageArea(tracks: Coordinate[][])` - Calculate geographic coverage
- `simplifyTrack(coords: Coordinate[], tolerance: number)` - Simplify track geometry

### Conversion Functions

- `coordinatesToGeojson(coords: Coordinate[], properties: object)` - Convert to GeoJSON
- `exportToGpx(tracks: Coordinate[][], metadata: object)` - Export to GPX format
- `getFileInfo(data: Uint8Array)` - Get file format information

### Utility Functions

- `calculateDistance(lat1, lon1, lat2, lon2)` - Calculate distance between points
- `utils.isValidCoordinate(lat, lon)` - Validate single coordinate (JS implementation)
- `utils.haversineDistance(lat1, lon1, lat2, lon2)` - Calculate distance (JS implementation)
- `utils.getBoundingBox(coords)` - Calculate bounding box (JS implementation)

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  Coordinate,
  HeatmapResult,
  HeatmapTrack,
  TrackStatistics,
  ValidationResult,
  FileInfo 
} from 'fastgeotoolkit';
```

## Performance

- **WebAssembly**: Near-native performance through Rust compilation
- **Memory Efficient**: Optimized for large GPS datasets
- **Browser Compatible**: Works in all modern browsers
- **Node.js Ready**: Full server-side support

## Framework Integration

### React

```tsx
import React, { useEffect, useState } from 'react';
import { init, processGpxFiles, type HeatmapResult } from 'fastgeotoolkit';

function RouteHeatmap() {
  const [heatmap, setHeatmap] = useState<HeatmapResult | null>(null);

  useEffect(() => {
    async function loadHeatmap() {
      await init();
      const result = await processGpxFiles([gpxData]);
      setHeatmap(result);
    }
    loadHeatmap();
  }, []);

  return (
    <div>
      {heatmap && (
        <p>Generated heatmap with {heatmap.tracks.length} tracks</p>
      )}
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <p v-if="heatmap">Tracks: {{ heatmap.tracks.length }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { init, processGpxFiles, type HeatmapResult } from 'fastgeotoolkit';

const heatmap = ref<HeatmapResult | null>(null);

onMounted(async () => {
  await init();
  heatmap.value = await processGpxFiles([gpxData]);
});
</script>
```

## Examples

See the [examples directory](./examples/) for complete usage examples:

- Basic coordinate processing
- Route density heatmap generation
- Real-time GPS track analysis
- Integration with mapping libraries

## License

MIT License - see [LICENSE](LICENSE) file for details.
