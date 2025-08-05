/**
 * @jest-environment node
 */

import { 
  processGpxFiles,
  processPolylines,
  init,
  HeatmapResult 
} from '../index';
import { sampleGpxData, samplePolyline, stringToUint8Array } from './testData';

// Initialize the WASM module once for all tests
beforeAll(async () => {
  await init();
}, 30000);

describe('File Processing Integration Tests', () => {
  test('should process GPX files and generate heatmap', async () => {
    const gpxBytes = stringToUint8Array(sampleGpxData);
    const result = await processGpxFiles([gpxBytes]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    expect(result.max_frequency).toBeGreaterThanOrEqual(1);
    
    if (result.tracks.length > 0) {
      const track = result.tracks[0];
      expect(track.coordinates).toBeDefined();
      expect(Array.isArray(track.coordinates)).toBe(true);
      expect(track.frequency).toBeGreaterThanOrEqual(1);
      expect(track.frequency).toBeLessThanOrEqual(result.max_frequency);
      
      // Verify coordinate structure
      if (track.coordinates.length > 0) {
        const coord = track.coordinates[0];
        expect(Array.isArray(coord)).toBe(true);
        expect(coord).toHaveLength(2);
        expect(typeof coord[0]).toBe('number'); // latitude
        expect(typeof coord[1]).toBe('number'); // longitude
      }
    }
  });

  test('should process multiple overlapping GPX files', async () => {
    const gpxBytes1 = stringToUint8Array(sampleGpxData);
    const gpxBytes2 = stringToUint8Array(sampleGpxData.replace('Test Track', 'Test Track 2'));
    
    const result = await processGpxFiles([gpxBytes1, gpxBytes2]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(result.max_frequency).toBeGreaterThanOrEqual(1);
    
    // With overlapping tracks, we should see higher frequencies
    const maxFreq = Math.max(...result.tracks.map(t => t.frequency));
    expect(maxFreq).toBeGreaterThan(1);
  });

  test('should handle empty GPX file list', async () => {
    const result = await processGpxFiles([]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    expect(result.tracks).toHaveLength(0);
    expect(result.max_frequency).toBe(1); // Default value
  });

  test('should handle invalid GPX data gracefully', async () => {
    const invalidGpx = stringToUint8Array('<invalid>not a gpx file</invalid>');
    
    // Should not throw but return empty/minimal result
    const result = await processGpxFiles([invalidGpx]);
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
  });

  test('should process polylines correctly', async () => {
    const result = await processPolylines([samplePolyline]);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    expect(result.max_frequency).toBeGreaterThanOrEqual(1);
    
    if (result.tracks.length > 0) {
      const track = result.tracks[0];
      expect(track.coordinates.length).toBeGreaterThan(0);
      expect(track.frequency).toBeGreaterThanOrEqual(1);
    }
  });

  test('should handle multiple identical polylines', async () => {
    const polylines = [samplePolyline, samplePolyline, samplePolyline];
    const result = await processPolylines(polylines);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    
    // Multiple identical polylines should result in higher frequency
    if (result.tracks.length > 0) {
      expect(result.max_frequency).toBeGreaterThan(1);
    }
  });

  test('should handle mixed valid and invalid polylines', async () => {
    const polylines = [samplePolyline, 'invalid_data', samplePolyline];
    const result = await processPolylines(polylines);
    
    expect(result).toBeDefined();
    expect(result.tracks).toBeDefined();
    expect(Array.isArray(result.tracks)).toBe(true);
    
    // Should process valid polylines despite invalid ones
    if (result.tracks.length > 0) {
      expect(result.max_frequency).toBeGreaterThan(1);
    }
  });
});
