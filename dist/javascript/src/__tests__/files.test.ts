/**
 * @jest-environment node
 */

import { 
  processGpxFiles,
  getFileInfo,
  exportToGpx,
  calculateTrackStatistics,
  simplifyTrack,
  calculateDistance,
  init,
  Coordinate
} from '../index';

// Initialize the WASM module before running tests
beforeAll(async () => {
  await init();
});

describe('File Processing', () => {
  test('should handle empty file array', async () => {
    const result = await processGpxFiles([]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toHaveLength(0);
    expect(result.max_frequency).toBe(0);
  });

  test('should handle invalid file data gracefully', async () => {
    const invalidData = new Uint8Array([1, 2, 3, 4, 5]); // Not a valid GPX/FIT file
    const result = await processGpxFiles([invalidData]);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
  });

  test('should process multiple files', async () => {
    const file1 = new Uint8Array([1, 2, 3]);
    const file2 = new Uint8Array([4, 5, 6]);
    
    const result = await processGpxFiles([file1, file2]);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    expect(typeof result.max_frequency).toBe('number');
  });
});

describe('File Info', () => {
  test('should get file info for unknown format', async () => {
    const invalidData = new Uint8Array([1, 2, 3, 4, 5]);
    const info = await getFileInfo(invalidData);
    
    expect(info).toBeDefined();
    expect(info.format).toBe('unknown');
    expect(info.valid).toBe(false);
    expect(info.file_size).toBe(5);
  });

  test('should handle empty file', async () => {
    const emptyData = new Uint8Array([]);
    const info = await getFileInfo(emptyData);
    
    expect(info).toBeDefined();
    expect(info.file_size).toBe(0);
  });

  test('should get basic file properties', async () => {
    const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const info = await getFileInfo(testData);
    
    expect(info).toBeDefined();
    expect(typeof info.format).toBe('string');
    expect(typeof info.valid).toBe('boolean');
    expect(typeof info.file_size).toBe('number');
    expect(typeof info.track_count).toBe('number');
    expect(typeof info.point_count).toBe('number');
  });
});

describe('GPX Export', () => {
  test('should export coordinates to GPX format', async () => {
    const tracks: Coordinate[][] = [
      [[40.7128, -74.0060], [40.7589, -73.9851]],
      [[41.8781, -87.6298], [41.8847, -87.6394]]
    ];
    
    const metadata = { creator: 'fastgeotoolkit-test' };
    const gpxContent = await exportToGpx(tracks, metadata);
    
    expect(typeof gpxContent).toBe('string');
    expect(gpxContent).toContain('<?xml');
    expect(gpxContent).toContain('<gpx');
    expect(gpxContent).toContain('<trk>');
    expect(gpxContent).toContain('<trkpt');
    expect(gpxContent).toContain('lat=');
    expect(gpxContent).toContain('lon=');
    
    // Should contain coordinates
    expect(gpxContent).toContain('40.7128');
    expect(gpxContent).toContain('-74.0060');
  });

  test('should handle empty tracks', async () => {
    const gpxContent = await exportToGpx([], {});
    
    expect(typeof gpxContent).toBe('string');
    expect(gpxContent).toContain('<?xml');
    expect(gpxContent).toContain('<gpx');
    expect(gpxContent).toContain('</gpx>');
  });

  test('should handle single track', async () => {
    const tracks: Coordinate[][] = [
      [[40.7128, -74.0060], [40.7589, -73.9851]]
    ];
    
    const gpxContent = await exportToGpx(tracks, {});
    
    expect(gpxContent).toContain('<trk>');
    expect(gpxContent).toContain('Track 1');
    expect(gpxContent).toContain('40.7128');
    expect(gpxContent).toContain('-74.0060');
  });

  test('should handle tracks with single point', async () => {
    const tracks: Coordinate[][] = [
      [[40.7128, -74.0060]]
    ];
    
    const gpxContent = await exportToGpx(tracks, {});
    
    expect(gpxContent).toContain('<trkpt');
    expect(gpxContent).toContain('40.7128');
    expect(gpxContent).toContain('-74.0060');
  });
});

describe('Edge Cases and Error Handling', () => {
  test('should handle coordinate arrays with extreme values', async () => {
    const extremeCoords: Coordinate[] = [
      [89.9999, 179.9999],   // Near pole and dateline
      [-89.9999, -179.9999], // Opposite extreme
      [0, 0]                  // Null Island
    ];
    
    // Test various functions with extreme coordinates
    const stats = await calculateTrackStatistics(extremeCoords);
    expect(stats).toBeDefined();
    
    const simplified = await simplifyTrack(extremeCoords, 0.1);
    expect(Array.isArray(simplified)).toBe(true);
  });

  test('should handle very large coordinate arrays', async () => {
    // Generate a large track
    const largeTrack: Coordinate[] = [];
    for (let i = 0; i < 1000; i++) {
      largeTrack.push([40 + i * 0.001, -74 + i * 0.001]);
    }
    
    const stats = await calculateTrackStatistics(largeTrack);
    expect(stats.point_count).toBe(1000);
    expect(stats.distance_km).toBeGreaterThan(0);
    
    const simplified = await simplifyTrack(largeTrack, 0.01);
    expect(simplified.length).toBeLessThanOrEqual(largeTrack.length);
  });

  test('should handle coordinate precision', async () => {
    const preciseCoords: Coordinate[] = [
      [40.123456789, -74.987654321],
      [40.123456790, -74.987654320]  // Very small difference
    ];
    
    const distance = await calculateDistance(
      preciseCoords[0][0], preciseCoords[0][1],
      preciseCoords[1][0], preciseCoords[1][1]
    );
    
    expect(distance).toBeGreaterThanOrEqual(0);
    expect(distance).toBeLessThan(1); // Should be very small distance
  });
});
