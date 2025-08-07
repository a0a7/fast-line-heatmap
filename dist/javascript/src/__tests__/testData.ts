/**
 * Test data utilities for JavaScript tests
 */

/**
 * Sample GPX file content for testing
 */
export const sampleGpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194"></trkpt>
      <trkpt lat="37.7849" lon="-122.4094"></trkpt>
      <trkpt lat="37.7949" lon="-122.3994"></trkpt>
      <trkpt lat="37.8049" lon="-122.3894"></trkpt>
    </trkseg>
  </trk>
</gpx>`;

/**
 * Sample polyline data (encoded)
 */
export const samplePolyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

/**
 * Sample coordinates for testing
 */
export const sampleCoordinates: [number, number][] = [
  [37.7749, -122.4194], // San Francisco
  [37.7849, -122.4094],
  [37.7949, -122.3994],
  [37.8049, -122.3894]
];

/**
 * Convert string to Uint8Array (for file processing tests)
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Sample invalid coordinates for validation testing
 */
export const invalidCoordinates: [number, number][] = [
  [91, 0],        // Invalid latitude
  [0, 181],       // Invalid longitude
  [NaN, 0],       // NaN latitude
  [0, Infinity],  // Infinite longitude
  [0, 0]          // Null island (technically valid but often filtered)
];

/**
 * Large dataset for performance testing
 */
export function generateLargeCoordinateSet(count: number): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    // Generate coordinates around San Francisco area
    const lat = 37.7 + (Math.random() - 0.5) * 0.2;
    const lon = -122.4 + (Math.random() - 0.5) * 0.2;
    coords.push([lat, lon]);
  }
  return coords;
}
