/**
 * @jest-environment node
 */

import './test-types';

describe('Browser WASM Integration Tests', () => {
  beforeEach(async () => {
    // Navigate to our test page
    await page.goto('http://localhost:3000/test.html');
    
    // Wait for the module to load
    await page.waitForFunction(() => window.testsReady === true, {
      timeout: 10000
    });
  });

  test('should load FastGeoToolkit in browser', async () => {
    const hasModule = await page.evaluate(() => {
      return typeof window.fastgeo !== 'undefined';
    });
    
    expect(hasModule).toBe(true);
    
    const exportedFunctions = await page.evaluate(() => {
      return Object.keys(window.fastgeo);
    });
    
    expect(exportedFunctions).toContain('init');
    expect(exportedFunctions).toContain('decodePolyline');
    expect(exportedFunctions).toContain('validateCoordinates');
    expect(exportedFunctions).toContain('calculateDistance');
  });

  test('should initialize WASM module in browser', async () => {
    const initResult = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(initResult.success).toBe(true);
    if (!initResult.success) {
      console.log('Init error:', initResult.error);
    }
  });

  test('should decode polylines with WASM', async () => {
    const result = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        const decoded = await window.fastgeo.decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
        return { 
          success: true, 
          data: decoded,
          isArray: Array.isArray(decoded),
          length: decoded?.length || 0,
          firstPoint: decoded?.[0] || null
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.isArray).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    if (result.firstPoint) {
      expect(result.firstPoint).toHaveLength(2);
      expect(typeof result.firstPoint[0]).toBe('number');
      expect(typeof result.firstPoint[1]).toBe('number');
    }
  });

  test('should validate coordinates with WASM', async () => {
    const result = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        const coords = [[45.0, -122.0], [0, 0], [90, 180]];
        const validation = await window.fastgeo.validateCoordinates(coords);
        return { 
          success: true, 
          data: validation,
          hasValidCount: typeof validation.valid_count === 'number',
          hasTotalCount: typeof validation.total_count === 'number',
          hasIssues: Array.isArray(validation.issues)
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.hasValidCount).toBe(true);
    expect(result.hasTotalCount).toBe(true);
    expect(result.hasIssues).toBe(true);
    
    if (result.data) {
      expect(result.data.total_count).toBe(3);
      expect(result.data.valid_count).toBeGreaterThanOrEqual(0);
      expect(result.data.valid_count).toBeLessThanOrEqual(3);
    }
  });

  test('should calculate distance with WASM', async () => {
    const result = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        // Distance between NYC and LA
        const distance = await window.fastgeo.calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
        return { 
          success: true, 
          distance: distance,
          isNumber: typeof distance === 'number',
          isPositive: distance > 0
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.isNumber).toBe(true);
    expect(result.isPositive).toBe(true);
    
    // Distance between NYC and LA should be roughly 3900-4000 km
    if (result.distance) {
      expect(result.distance).toBeGreaterThan(3000);
      expect(result.distance).toBeLessThan(5000);
    }
  });

  test('should simplify tracks with WASM', async () => {
    const result = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        const coords = [
          [40.0, -120.0], 
          [40.001, -120.001], 
          [40.002, -120.002],
          [40.01, -120.01],
          [40.02, -120.02]
        ];
        const simplified = await window.fastgeo.simplifyTrack(coords, 0.005);
        return { 
          success: true, 
          original: coords,
          simplified: simplified,
          isArray: Array.isArray(simplified),
          isSimplified: simplified.length <= coords.length
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.isArray).toBe(true);
    expect(result.isSimplified).toBe(true);
    
    if (result.simplified) {
      expect(result.simplified.length).toBeGreaterThan(0);
      expect(result.simplified.length).toBeLessThanOrEqual(result.original.length);
    }
  });

  test('should handle empty inputs gracefully in browser', async () => {
    const result = await page.evaluate(async () => {
      try {
        await window.fastgeo.init();
        
        const emptyPolyline = await window.fastgeo.decodePolyline('');
        const emptyGpx = await window.fastgeo.processGpxFiles([]);
        const emptyPolylines = await window.fastgeo.processPolylines([]);
        
        return { 
          success: true,
          emptyPolyline: {
            isArray: Array.isArray(emptyPolyline),
            length: emptyPolyline.length
          },
          emptyGpx: {
            hasTracks: 'tracks' in emptyGpx,
            tracksIsArray: Array.isArray(emptyGpx.tracks)
          },
          emptyPolylines: {
            hasTracks: 'tracks' in emptyPolylines,
            tracksIsArray: Array.isArray(emptyPolylines.tracks)
          }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.emptyPolyline.isArray).toBe(true);
    expect(result.emptyPolyline.length).toBe(0);
    expect(result.emptyGpx.hasTracks).toBe(true);
    expect(result.emptyGpx.tracksIsArray).toBe(true);
    expect(result.emptyPolylines.hasTracks).toBe(true);
    expect(result.emptyPolylines.tracksIsArray).toBe(true);
  });
});
