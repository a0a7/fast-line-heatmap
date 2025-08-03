/**
 * @jest-environment node
 */

import { 
  decodePolyline, 
  validateCoordinates,
  calculateDistance,
  simplifyTrack,
  init,
  Coordinate 
} from '../index';

// Initialize the WASM module before running tests
beforeAll(async () => {
  await init();
});

describe('Polyline Decoding', () => {
  test('should decode polyline correctly', async () => {
    const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    const decoded = await decodePolyline(encoded);
    
    expect(decoded).toHaveLength(3);
    expect(decoded[0][0]).toBeCloseTo(38.5, 1);
    expect(decoded[0][1]).toBeCloseTo(-120.2, 1);
  });

  test('should handle empty polyline', async () => {
    const empty = await decodePolyline('');
    expect(empty).toEqual([]);
  });

  test('should handle invalid polyline gracefully', async () => {
    const invalid = await decodePolyline('invalid_data');
    expect(Array.isArray(invalid)).toBe(true);
  });
});

describe('Coordinate Validation', () => {
  test('should validate correct coordinates', async () => {
    const validCoords: Coordinate[] = [
      [45.0, -122.0],
      [0, 0],
      [89, 179],
      [-89, -179]
    ];
    
    const result = await validateCoordinates(validCoords);
    expect(result.valid_count).toBe(validCoords.length);
    expect(result.issues).toHaveLength(0);
  });

  test('should detect invalid coordinates', async () => {
    const invalidCoords: Coordinate[] = [
      [91, 0],      // Invalid latitude
      [0, 181],     // Invalid longitude
      [NaN, 0],     // NaN values
      [0, Infinity] // Infinite values
    ];
    
    const result = await validateCoordinates(invalidCoords);
    expect(result.valid_count).toBe(0);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test('should handle mixed valid/invalid coordinates', async () => {
    const mixedCoords: Coordinate[] = [
      [45.0, -122.0], // Valid
      [91, 0],        // Invalid latitude
      [40.7, -74.0]   // Valid
    ];
    
    const result = await validateCoordinates(mixedCoords);
    expect(result.valid_count).toBe(2);
    expect(result.total_count).toBe(3);
    expect(result.issues).toHaveLength(1);
  });
});

describe('Distance Calculations', () => {
  test('should calculate distance between coordinates', async () => {
    const lat1 = 40.7128, lon1 = -74.0060; // New York
    const lat2 = 34.0522, lon2 = -118.2437; // Los Angeles
    
    const distance = await calculateDistance(lat1, lon1, lat2, lon2);
    
    // Expected distance is approximately 3944 km
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  test('should return zero for identical coordinates', async () => {
    const lat = 45.0, lon = -122.0;
    const distance = await calculateDistance(lat, lon, lat, lon);
    expect(distance).toBe(0);
  });

  test('should handle edge cases', async () => {
    // Points on opposite sides of Earth
    const distance = await calculateDistance(0, 0, 0, 180);
    expect(distance).toBeGreaterThan(19000); // Approximately half Earth's circumference
  });
});

describe('Track Simplification', () => {
  test('should simplify coordinates with tolerance', async () => {
    const coordinates: Coordinate[] = [
      [40.0, -120.0],
      [40.001, -120.001], // Very close point
      [40.01, -120.01],   // Further point
      [40.1, -120.1]      // Much further point
    ];
    
    const simplified = await simplifyTrack(coordinates, 0.005);
    expect(simplified.length).toBeLessThanOrEqual(coordinates.length);
    expect(simplified[0]).toEqual(coordinates[0]); // First point preserved
    expect(simplified[simplified.length - 1]).toEqual(coordinates[coordinates.length - 1]); // Last point preserved
  });

  test('should preserve all points with zero tolerance', async () => {
    const coordinates: Coordinate[] = [
      [40.0, -120.0],
      [40.001, -120.001],
      [40.01, -120.01]
    ];
    
    const simplified = await simplifyTrack(coordinates, 0);
    expect(simplified).toHaveLength(coordinates.length);
  });

  test('should handle edge cases', async () => {
    // Empty array
    expect(await simplifyTrack([], 0.01)).toEqual([]);
    
    // Single point
    const single: Coordinate[] = [[40.0, -120.0]];
    expect(await simplifyTrack(single, 0.01)).toEqual(single);
    
    // Two points
    const two: Coordinate[] = [[40.0, -120.0], [41.0, -121.0]];
    expect(await simplifyTrack(two, 0.01)).toEqual(two);
  });
});
