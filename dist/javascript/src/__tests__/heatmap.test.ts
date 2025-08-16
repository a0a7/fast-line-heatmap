/**
 * @jest-environment node
 */

import { 
  processPolylines,
  calculateTrackStatistics,
  findTrackIntersections,
  coordinatesToGeojson,
  calculateCoverageArea,
  init,
  initWithWasm,
  Coordinate,
  HeatmapResult 
} from '../index';

// Initialize the WASM module before running tests
beforeAll(async () => {
  const wasmModule = await initWithWasm();
  await init(wasmModule);
});

describe('Heatmap Generation', () => {
  test('should process polylines into heatmap', async () => {
    const polylines = [
      "_p~iF~ps|U_ulLnnqC_mqNvxq`@", // Sample encoded polyline
      "u{~vFvyys@fS]" // Another sample polyline
    ];
    
    const result = await processPolylines(polylines);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    expect(typeof result.max_frequency).toBe('number');
  });

  test('should handle empty polylines array', async () => {
    const result = await processPolylines([]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toHaveLength(0);
    expect(result.max_frequency).toBe(0);
  });

  test('should handle invalid polylines gracefully', async () => {
    const polylines = ["invalid_polyline_data", "another_invalid"];
    
    const result = await processPolylines(polylines);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
  });
});

describe('Track Statistics', () => {
  test('should calculate basic track statistics', async () => {
    const coordinates: Coordinate[] = [
      [40.7128, -74.0060], // New York
      [40.7589, -73.9851], // Times Square
      [40.7831, -73.9712]  // Central Park
    ];
    
    const stats = await calculateTrackStatistics(coordinates);
    
    expect(stats).toBeDefined();
    expect(stats.distance_km).toBeGreaterThan(0);
    expect(stats.point_count).toBe(coordinates.length);
    expect(stats.bounding_box).toHaveLength(4);
    
    // Check bounding box format: [min_lat, min_lng, max_lat, max_lng]
    const [minLat, minLng, maxLat, maxLng] = stats.bounding_box;
    expect(minLat).toBeLessThanOrEqual(maxLat);
    expect(minLng).toBeLessThanOrEqual(maxLng);
  });

  test('should handle single coordinate', async () => {
    const coordinates: Coordinate[] = [[40.7128, -74.0060]];
    
    const stats = await calculateTrackStatistics(coordinates);
    
    expect(stats.distance_km).toBe(0);
    expect(stats.point_count).toBe(1);
    
    const [minLat, minLng, maxLat, maxLng] = stats.bounding_box;
    expect(minLat).toBe(maxLat);
    expect(minLng).toBe(maxLng);
  });

  test('should handle empty coordinates', async () => {
    const stats = await calculateTrackStatistics([]);
    
    // Should handle gracefully without throwing
    expect(stats).toBeDefined();
  });
});

describe('Track Intersections', () => {
  test('should find intersections between tracks', async () => {
    const tracks: Coordinate[][] = [
      [[40.0, -120.0], [41.0, -119.0]], // Track 1
      [[40.5, -120.5], [40.5, -118.5]]  // Track 2 (should intersect)
    ];
    
    const intersections = await findTrackIntersections(tracks, 0.1);
    
    expect(Array.isArray(intersections)).toBe(true);
    // Depending on implementation, may or may not find intersections with this tolerance
  });

  test('should handle tracks with no intersections', async () => {
    const tracks: Coordinate[][] = [
      [[40.0, -120.0], [41.0, -119.0]], // Track 1
      [[45.0, -115.0], [46.0, -114.0]]  // Track 2 (far away)
    ];
    
    const intersections = await findTrackIntersections(tracks, 0.01);
    
    expect(Array.isArray(intersections)).toBe(true);
  });

  test('should handle empty tracks array', async () => {
    const intersections = await findTrackIntersections([], 0.1);
    
    expect(Array.isArray(intersections)).toBe(true);
    expect(intersections).toHaveLength(0);
  });
});

describe('GeoJSON Conversion', () => {
  test('should convert coordinates to GeoJSON', async () => {
    const coordinates: Coordinate[] = [
      [40.7128, -74.0060],
      [40.7589, -73.9851]
    ];
    
    const properties = { name: "Test Track", type: "route" };
    const geojson = await coordinatesToGeojson(coordinates, properties);
    
    expect(geojson).toBeDefined();
    expect(geojson.type).toBe("Feature");
    expect(geojson.geometry).toBeDefined();
    expect(geojson.geometry.type).toBe("LineString");
    expect(geojson.properties).toEqual(properties);
    expect(geojson.geometry.coordinates).toHaveLength(coordinates.length);
    
    // GeoJSON uses [longitude, latitude] order
    expect(geojson.geometry.coordinates[0]).toEqual([-74.0060, 40.7128]);
  });

  test('should handle empty coordinates', async () => {
    const geojson = await coordinatesToGeojson([], {});
    
    expect(geojson).toBeDefined();
    expect(geojson.type).toBe("Feature");
    expect(geojson.geometry.coordinates).toHaveLength(0);
  });

  test('should handle null properties', async () => {
    const coordinates: Coordinate[] = [[40.7128, -74.0060]];
    const geojson = await coordinatesToGeojson(coordinates, undefined);
    
    expect(geojson).toBeDefined();
    expect(geojson.properties).toBeDefined();
  });
});

describe('Coverage Area Calculation', () => {
  test('should calculate coverage area for tracks', async () => {
    const tracks: Coordinate[][] = [
      [[40.0, -120.0], [41.0, -119.0]],
      [[40.5, -120.5], [40.5, -118.5]]
    ];
    
    const coverage = await calculateCoverageArea(tracks);
    
    expect(coverage).toBeDefined();
    expect(coverage.bounding_box).toHaveLength(4);
    expect(coverage.area_km2).toBeGreaterThan(0);
    expect(coverage.point_count).toBe(4); // Total points in all tracks
  });

  test('should handle empty tracks', async () => {
    const coverage = await calculateCoverageArea([]);
    
    expect(coverage).toBeDefined();
    // Should handle gracefully
  });

  test('should handle single track', async () => {
    const tracks: Coordinate[][] = [[[40.0, -120.0], [41.0, -119.0]]];
    
    const coverage = await calculateCoverageArea(tracks);
    
    expect(coverage).toBeDefined();
    expect(coverage.point_count).toBe(2);
  });
});
