use fastgeotoolkit::*;

#[cfg(test)]
mod comprehensive_functionality_tests {
    use super::*;

    // Sample polyline data (encoded format like from Strava) - using a simpler, safer example
    const STRAVA_POLYLINE: &str = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    
    // Sample RideWithGPS format (JSON coordinates)
    const RWGPS_COORDS: &str = r#"[[37.7749,-122.4194],[37.7849,-122.4094],[37.7949,-122.3994],[37.8049,-122.3894]]"#;

    // Sample tracks for heatmap testing
    fn create_overlapping_tracks() -> Vec<Vec<[f64; 2]>> {
        vec![
            // Main street (high frequency)
            vec![
                [37.7749, -122.4194],
                [37.7849, -122.4094],
                [37.7949, -122.3994],
                [37.8049, -122.3894],
            ],
            // Same street again (increases frequency)
            vec![
                [37.7749, -122.4194],
                [37.7849, -122.4094],
                [37.7949, -122.3994],
                [37.8049, -122.3894],
            ],
            // Parallel street (medium frequency)
            vec![
                [37.7750, -122.4195],
                [37.7850, -122.4095],
                [37.7950, -122.3995],
                [37.8050, -122.3895],
            ],
            // Cross street (creates intersections)
            vec![
                [37.7800, -122.4250],
                [37.7800, -122.4150],
                [37.7800, -122.4050],
                [37.7800, -122.3950],
            ],
        ]
    }

    #[test]
    fn test_polyline_processing() {
        // Test Strava-style encoded polyline
        let coords = process_polyline(STRAVA_POLYLINE);
        assert!(!coords.is_empty(), "Should decode Strava polyline");
        
        // All coordinates should be valid
        for coord in &coords {
            assert!(coord[0] >= -90.0 && coord[0] <= 90.0, "Latitude should be valid: {}", coord[0]);
            assert!(coord[1] >= -180.0 && coord[1] <= 180.0, "Longitude should be valid: {}", coord[1]);
        }

        // Test RideWithGPS-style JSON coordinates
        let json_coords = process_polyline(RWGPS_COORDS);
        assert_eq!(json_coords.len(), 4, "Should parse JSON coordinates");
        
        // Test invalid polyline
        let invalid_coords = process_polyline("invalid_polyline_data");
        assert!(invalid_coords.is_empty(), "Should return empty for invalid data");
    }

    #[test]
    fn test_heatmap_generation() {
        let tracks = create_overlapping_tracks();
        let heatmap = create_heatmap_from_tracks(tracks);
        
        assert!(!heatmap.tracks.is_empty(), "Heatmap should contain tracks");
        assert!(heatmap.max_frequency > 0, "Max frequency should be positive");
        assert!(heatmap.max_frequency >= 1, "Max frequency should be at least 1");
        
        // Find tracks with maximum frequency (the repeated main street)
        let max_freq_tracks: Vec<_> = heatmap.tracks.iter()
            .filter(|track| track.frequency == heatmap.max_frequency)
            .collect();
        
        assert!(!max_freq_tracks.is_empty(), "Should have tracks with max frequency");
        
        // Verify frequency calculation
        let frequencies: Vec<u32> = heatmap.tracks.iter().map(|t| t.frequency).collect();
        assert!(frequencies.iter().any(|&f| f > 1), "Should have tracks with frequency > 1");
    }

    #[test]
    fn test_segment_key_generation() {
        let start = [37.7749, -122.4194];
        let end = [37.7849, -122.4094];
        
        let key1 = create_segment_key(start, end);
        let key2 = create_segment_key(end, start); // reversed
        
        // Keys should be identical for bidirectional segments
        assert_eq!(key1, key2, "Segment keys should be direction-independent");
        
        // Nearby points should snap to same grid
        let nearby_start = [37.7749001, -122.4194001];
        let key3 = create_segment_key(nearby_start, end);
        assert_eq!(key1, key3, "Nearby points should snap to same grid");
    }

    #[test]
    fn test_unrealistic_jump_filtering() {
        // Create coordinates with unrealistic jumps
        let coords_with_jumps = vec![
            [37.7749, -122.4194],  // San Francisco
            [37.7849, -122.4094],  // Nearby (good)
            [40.7128, -74.0060],   // Instant teleport to NYC (bad)
            [40.7228, -74.0160],   // NYC area (good relative to previous)
            [51.5074, -0.1278],    // Instant teleport to London (bad)
        ];
        
        let filtered = filter_unrealistic_jumps(&coords_with_jumps);
        
        // Should filter out the unrealistic jumps
        assert!(filtered.len() < coords_with_jumps.len(), "Should filter out some points");
        assert!(filtered.len() >= 2, "Should keep some valid segments");
        
        // Check that no consecutive points have unrealistic distances
        for window in filtered.windows(2) {
            if let [p1, p2] = window {
                let distance = calculate_distance_between_points(p1[0], p1[1], p2[0], p2[1]);
                assert!(distance <= 100.0, "No consecutive points should be > 100km apart");
            }
        }
    }

    #[test]
    fn test_fit_file_detection() {
        // Valid FIT file header
        let valid_fit_header = vec![
            14, 16, // header size, protocol version
            0x20, 0x02, // profile version
            0x00, 0x10, 0x00, 0x00, // data size (fake)
            b'.', b'F', b'I', b'T', // signature
            0x00, 0x00 // CRC (fake)
        ];
        
        assert!(is_fit_file(&valid_fit_header), "Should detect valid FIT file");
        
        // Invalid file
        let invalid_file = vec![0x00, 0x01, 0x02, 0x03];
        assert!(!is_fit_file(&invalid_file), "Should reject invalid file");
        
        // GPX file start
        let gpx_start = b"<?xml version=\"1.0\"";
        assert!(!is_fit_file(gpx_start), "Should not detect GPX as FIT");
    }

    #[test]
    fn test_coordinate_validation_edge_cases() {
        // Test boundary values
        let boundary_coords = vec![
            [90.0, 180.0],     // Valid: maximum values
            [-90.0, -180.0],   // Valid: minimum values
            [0.0, 0.0],        // Invalid: null island
            [90.1, 0.0],       // Invalid: latitude too high
            [-90.1, 0.0],      // Invalid: latitude too low
            [0.0, 180.1],      // Invalid: longitude too high
            [0.0, -180.1],     // Invalid: longitude too low
            [f64::NAN, 0.0],   // Invalid: NaN latitude
            [0.0, f64::NAN],   // Invalid: NaN longitude
            [f64::INFINITY, 0.0], // Invalid: infinite latitude
        ];
        
        let (valid_count, issues) = validate_coordinates_rust(&boundary_coords);
        assert_eq!(valid_count, 2, "Should have exactly 2 valid coordinates");
        assert_eq!(issues.len(), 8, "Should report 8 validation issues");
    }

    #[test]
    fn test_track_simplification_precision() {
        // Create a track with many close points
        let mut dense_track = Vec::new();
        for i in 0..100 {
            let lat = 37.7749 + (i as f64) * 0.00001; // Very small increments
            let lng = -122.4194 + (i as f64) * 0.00001;
            dense_track.push([lat, lng]);
        }
        
        // Test different tolerance levels
        let simplified_aggressive = simplify_coordinates_rust(&dense_track, 0.001);
        let simplified_conservative = simplify_coordinates_rust(&dense_track, 0.00001);
        
        assert!(simplified_aggressive.len() < simplified_conservative.len(), 
                "Aggressive simplification should reduce more points");
        assert!(simplified_conservative.len() <= dense_track.len(), 
                "Conservative simplification should not add points");
        
        // Should always keep first and last points
        assert_eq!(simplified_aggressive[0], dense_track[0], "Should keep first point");
        assert_eq!(simplified_aggressive.last(), dense_track.last(), "Should keep last point");
    }

    #[test]
    fn test_intersection_detection_accuracy() {
        // Create tracks that definitely intersect
        let intersecting_tracks = vec![
            // Horizontal line
            vec![
                [37.7800, -122.4200],
                [37.7800, -122.4100],
                [37.7800, -122.4000],
            ],
            // Vertical line
            vec![
                [37.7850, -122.4150],
                [37.7800, -122.4150], // This point should intersect
                [37.7750, -122.4150],
            ],
        ];
        
        let intersections = find_track_intersections_rust(&intersecting_tracks, 0.01);
        assert!(!intersections.is_empty(), "Should find intersection");
        
        let (intersection_point, track_indices) = &intersections[0];
        assert_eq!(track_indices.len(), 2, "Intersection should involve 2 tracks");
        
        // Intersection should be near the expected location
        let expected_lat = 37.7800;
        let expected_lng = -122.4150;
        let lat_diff = (intersection_point[0] - expected_lat).abs();
        let lng_diff = (intersection_point[1] - expected_lng).abs();
        assert!(lat_diff < 0.01, "Intersection latitude should be close");
        assert!(lng_diff < 0.01, "Intersection longitude should be close");
    }

    #[test]
    fn test_coverage_area_calculation() {
        // Test with known bounding box
        let test_coords = vec![
            [37.7000, -122.5000], // SW corner
            [37.8000, -122.5000], // NW corner  
            [37.8000, -122.4000], // NE corner
            [37.7000, -122.4000], // SE corner
        ];
        
        let tracks = vec![test_coords];
        let result = calculate_coverage_area_rust(&tracks);
        assert!(result.is_some(), "Should calculate coverage");
        
        let (bbox, area_km2, point_count) = result.unwrap();
        assert_eq!(point_count, 4, "Should count all points");
        assert!(area_km2 > 0.0, "Area should be positive");
        
        // Check bounding box
        let [min_lat, min_lng, max_lat, max_lng] = bbox;
        assert!((min_lat - 37.7000).abs() < 0.001, "Min lat should match");
        assert!((max_lat - 37.8000).abs() < 0.001, "Max lat should match");
        assert!((min_lng - (-122.5000)).abs() < 0.001, "Min lng should match");
        assert!((max_lng - (-122.4000)).abs() < 0.001, "Max lng should match");
    }

    #[test]
    fn test_track_clustering_similarity() {
        // Create similar and dissimilar tracks
        let tracks = vec![
            // Group 1: Similar tracks (SF area)
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![[37.7750, -122.4195], [37.7850, -122.4095]], // Very similar
            
            // Group 2: Different area (NYC)
            vec![[40.7128, -74.0060], [40.7228, -74.0160]],
        ];
        
        let clusters = cluster_tracks_by_similarity_rust(&tracks, 0.8); // High similarity threshold
        
        // Should create clusters based on geographic proximity
        assert!(!clusters.is_empty(), "Should create clusters");
        
        for (representative, members, score) in &clusters {
            assert!(!representative.is_empty(), "Representative should not be empty");
            assert!(!members.is_empty(), "Should have cluster members");
            assert!(*score >= 0.0 && *score <= 1.0, "Score should be normalized");
        }
    }

    #[test]
    fn test_geojson_coordinate_order() {
        // GeoJSON uses [longitude, latitude] order (opposite of our internal format)
        let coords = vec![[37.7749, -122.4194]]; // [lat, lng]
        let properties = serde_json::json!({"test": true});
        
        let geojson = coordinates_to_geojson_rust(&coords, properties);
        let coordinates = geojson["geometry"]["coordinates"].as_array().unwrap();
        let first_coord = coordinates[0].as_array().unwrap();
        
        // Should be [lng, lat] in GeoJSON
        assert_eq!(first_coord[0].as_f64().unwrap(), -122.4194, "First element should be longitude");
        assert_eq!(first_coord[1].as_f64().unwrap(), 37.7749, "Second element should be latitude");
    }

    #[test]
    fn test_gpx_export_format() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![[40.7128, -74.0060], [40.7228, -74.0160]],
        ];
        
        let gpx = export_to_gpx_rust(&tracks);
        
        // Check XML structure
        assert!(gpx.starts_with("<?xml"), "Should start with XML declaration");
        assert!(gpx.contains("<gpx"), "Should contain GPX element");
        assert!(gpx.ends_with("</gpx>"), "Should end with closing GPX tag");
        
        // Check track structure
        assert!(gpx.contains("<trk>"), "Should contain track elements");
        assert!(gpx.contains("<trkseg>"), "Should contain track segments");
        assert!(gpx.contains("<trkpt"), "Should contain track points");
        
        // Count tracks and points
        let track_count = gpx.matches("<trk>").count();
        assert_eq!(track_count, 2, "Should have 2 tracks");
        
        let point_count = gpx.matches("<trkpt").count();
        assert_eq!(point_count, 4, "Should have 4 track points total");
    }

    #[test]
    fn test_round_function_precision() {
        let test_values = vec![
            (37.123456789, 37.12346),
            (-122.987654321, -122.98765),
            (0.000001, 0.00000),
            (90.0, 90.0),
        ];
        
        for (input, expected) in test_values {
            let rounded = round(input);
            assert!((rounded - expected).abs() < 0.000001, 
                   "Round({}) = {}, expected {}", input, rounded, expected);
        }
    }

    #[test]
    fn test_snap_to_grid_consistency() {
        let tolerance = 0.001;
        let point1 = [37.7749, -122.4194];
        let point2 = [37.7749001, -122.4194001]; // Very close point
        
        let snapped1 = snap_to_grid(point1, tolerance);
        let snapped2 = snap_to_grid(point2, tolerance);
        
        assert_eq!(snapped1, snapped2, "Close points should snap to same grid");
        
        // Test grid alignment
        let grid_lat = (snapped1[0] / tolerance).round() * tolerance;
        let grid_lng = (snapped1[1] / tolerance).round() * tolerance;
        
        assert!((snapped1[0] - grid_lat).abs() < f64::EPSILON, "Should be aligned to grid");
        assert!((snapped1[1] - grid_lng).abs() < f64::EPSILON, "Should be aligned to grid");
    }

    #[test]
    fn test_track_resampling_accuracy() {
        // Create a track with known characteristics
        let original_track = vec![
            [37.7749, -122.4194],
            [37.7799, -122.4144],
            [37.7849, -122.4094],
            [37.7899, -122.4044],
            [37.7949, -122.3994],
        ];
        
        // Test resampling to fewer points
        let resampled = resample_track_rust(&original_track, 3);
        assert!(resampled.len() <= 4, "Should not exceed target + 1"); // +1 for last point
        assert_eq!(resampled[0], original_track[0], "Should keep first point");
        assert_eq!(resampled.last(), original_track.last(), "Should keep last point");
        
        // Test resampling to more points than original
        let upsampled = resample_track_rust(&original_track, 10);
        assert_eq!(upsampled.len(), original_track.len(), "Should not add points when upsampling");
    }

    #[test]
    fn test_performance_benchmarks() {
        // Create larger datasets for performance testing
        let mut large_track = Vec::new();
        for i in 0..10000 {
            let lat = 37.7749 + (i as f64) * 0.0001;
            let lng = -122.4194 + (i as f64) * 0.0001;
            large_track.push([lat, lng]);
        }
        
        // Test various operations with timing
        let start = std::time::Instant::now();
        let simplified = simplify_coordinates_rust(&large_track, 0.001);
        let simplify_time = start.elapsed();
        
        let start = std::time::Instant::now();
        let bbox = get_bounding_box_rust(&large_track);
        let bbox_time = start.elapsed();
        
        let start = std::time::Instant::now();
        let resampled = resample_track_rust(&large_track, 1000);
        let resample_time = start.elapsed();
        
        // Performance assertions (adjust thresholds as needed)
        assert!(simplify_time.as_millis() < 100, "Simplification should be fast");
        assert!(bbox_time.as_millis() < 10, "Bounding box calculation should be very fast");
        assert!(resample_time.as_millis() < 50, "Resampling should be fast");
        
        // Correctness assertions
        assert!(!simplified.is_empty(), "Simplification should produce results");
        assert_eq!(bbox.len(), 4, "Bounding box should have 4 values");
        assert_eq!(resampled.len(), 1001, "Resampling should hit target (+1 for last point)");
        
        println!("Performance results:");
        println!("  Simplify 10k points: {:?}", simplify_time);
        println!("  Bounding box 10k points: {:?}", bbox_time);
        println!("  Resample 10k->1k points: {:?}", resample_time);
    }
}
