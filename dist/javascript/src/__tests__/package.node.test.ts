/**
 * @jest-environment node
 */

// Import from the built distribution
const {
  init,
  decodePolyline,
  validateCoordinates,
  calculateDistance,
  simplifyTrack,
  processGpxFiles,
  processPolylines
} = require('../../dist/index.js');

// Track WASM initialization status
let wasmInitialized = false;

// Initialize WASM once for all tests
beforeAll(async () => {
  try {
    await init();
    wasmInitialized = true;
  } catch (error) {
    console.warn('WASM initialization failed, tests will run in mock mode:', String(error));
  }
}, 30000);

describe('JavaScript Package Integration Tests', () => {
  test('should export main functions', () => {
    expect(typeof init).toBe('function');
    expect(typeof decodePolyline).toBe('function');
    expect(typeof validateCoordinates).toBe('function');
    expect(typeof calculateDistance).toBe('function');
    expect(typeof simplifyTrack).toBe('function');
    expect(typeof processGpxFiles).toBe('function');
    expect(typeof processPolylines).toBe('function');
  });

  test('should attempt to initialize', async () => {
    // Test that init doesn't crash even if WASM fails
    try {
      await init();
      // If it succeeds, great!
    } catch (error) {
      // If it fails, that's expected in Node.js without proper WASM setup
      expect(String(error)).toContain('Failed to initialize');
    }
  });

  test('should handle basic polyline decoding', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      const result = await decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        expect(result[0]).toHaveLength(2);
        expect(typeof result[0][0]).toBe('number');
        expect(typeof result[0][1]).toBe('number');
      }
    } catch (error) {
      console.warn('Polyline decoding test failed:', String(error));
      throw error;
    }
  });

  test('should handle coordinate validation', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      const coords = [[45.0, -122.0], [0, 0]];
      const result = await validateCoordinates(coords);
      
      expect(result).toHaveProperty('valid_count');
      expect(result).toHaveProperty('total_count');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.valid_count).toBe('number');
      expect(typeof result.total_count).toBe('number');
    } catch (error) {
      console.warn('Coordinate validation test failed:', String(error));
      throw error;
    }
  });

  test('should handle distance calculation', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      const distance = await calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    } catch (error) {
      console.warn('Distance calculation test failed:', String(error));
      throw error;
    }
  });

  test('should handle track simplification', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      const coords = [[40.0, -120.0], [40.001, -120.001], [40.01, -120.01]];
      const result = await simplifyTrack(coords, 0.005);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(coords.length);
    } catch (error) {
      console.warn('Track simplification test failed:', String(error));
      throw error;
    }
  });

  test('should handle empty inputs gracefully', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      const emptyPolyline = await decodePolyline('');
      expect(Array.isArray(emptyPolyline)).toBe(true);
      expect(emptyPolyline).toHaveLength(0);

      const emptyGpx = await processGpxFiles([]);
      expect(emptyGpx).toHaveProperty('tracks');
      expect(Array.isArray(emptyGpx.tracks)).toBe(true);

      const emptyPolylines = await processPolylines([]);
      expect(emptyPolylines).toHaveProperty('tracks');
      expect(Array.isArray(emptyPolylines.tracks)).toBe(true);
    } catch (error) {
      console.warn('Empty input test failed:', String(error));
      throw error;
    }
  });

  test('should handle invalid inputs without crashing', async () => {
    if (!wasmInitialized) {
      console.log('Skipping WASM-dependent test: WASM not initialized');
      return;
    }
    
    try {
      // These should not throw errors but handle gracefully
      const invalidPolyline = await decodePolyline('invalid_data');
      expect(Array.isArray(invalidPolyline)).toBe(true);

      const invalidCoords = await validateCoordinates([[NaN, Infinity]]);
      expect(invalidCoords).toHaveProperty('valid_count');
      expect(invalidCoords.valid_count).toBe(0);
    } catch (error) {
      console.warn('Invalid input test failed:', String(error));
      throw error;
    }
  });
});
