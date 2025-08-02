#[cfg(test)]
mod additional_coverage_tests {
    use fastgeotoolkit::*;

    // Test polyline encoding functionality
    #[test]
    fn test_coordinates_to_polyline_rust() {
        let coords = vec![
            [37.7749, -122.4194],
            [37.7849, -122.4094],
            [37.7949, -122.3994],
        ];
        let encoded = coordinates_to_polyline_rust(&coords);
        assert!(!encoded.is_empty());

        // Decode it back to verify roundtrip
        let decoded = decode_polyline(&encoded);
        assert!(!decoded.is_empty());

        // Should be close to original (within rounding tolerance)
        for (orig, dec) in coords.iter().zip(decoded.iter()) {
            assert!((orig[0] - dec[0]).abs() < 0.001);
            assert!((orig[1] - dec[1]).abs() < 0.001);
        }
    }

    #[test]
    fn test_coordinates_to_polyline_empty() {
        let coords = vec![];
        let encoded = coordinates_to_polyline_rust(&coords);
        assert!(encoded.is_empty());
    }

    #[test]
    fn test_coordinates_to_polyline_single_point() {
        let coords = vec![[37.7749, -122.4194]];
        let encoded = coordinates_to_polyline_rust(&coords);
        assert!(!encoded.is_empty());
    }

    // Test GeoJSON conversion
    #[test]
    fn test_coordinates_to_geojson_rust() {
        let coords = vec![[37.7749, -122.4194], [37.7849, -122.4094]];
        let properties = serde_json::json!({"name": "test_track"});
        let geojson = coordinates_to_geojson_rust(&coords, properties);

        assert_eq!(geojson["type"], "Feature");
        assert_eq!(geojson["geometry"]["type"], "LineString");
        assert_eq!(geojson["properties"]["name"], "test_track");

        // Check coordinate order is [lng, lat] for GeoJSON
        let coordinates = &geojson["geometry"]["coordinates"];
        assert_eq!(coordinates[0][0], -122.4194); // longitude first
        assert_eq!(coordinates[0][1], 37.7749); // latitude second
    }

    #[test]
    fn test_coordinates_to_geojson_empty_properties() {
        let coords = vec![[37.7749, -122.4194]];
        let properties = serde_json::json!({});
        let geojson = coordinates_to_geojson_rust(&coords, properties);

        assert_eq!(geojson["type"], "Feature");
        assert!(geojson["properties"].as_object().unwrap().is_empty());
    }

    // Test GPX export
    #[test]
    fn test_export_to_gpx_rust() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![[40.7128, -74.0060], [40.7228, -74.0160]],
        ];

        let gpx = export_to_gpx_rust(&tracks);

        assert!(gpx.contains("<?xml version=\"1.0\""));
        assert!(gpx.contains("<gpx version=\"1.1\""));
        assert!(gpx.contains("<trk>"));
        assert!(gpx.contains("<trkpt lat=\"37.774900\" lon=\"-122.419400\">"));
        assert!(gpx.contains("<trkpt lat=\"40.712800\" lon=\"-74.006000\">"));
        assert!(gpx.contains("Track 1"));
        assert!(gpx.contains("Track 2"));
        assert!(gpx.contains("</gpx>"));
    }

    #[test]
    fn test_export_to_gpx_empty() {
        let tracks = vec![];
        let gpx = export_to_gpx_rust(&tracks);

        assert!(gpx.contains("<?xml version=\"1.0\""));
        assert!(gpx.contains("</gpx>"));
        assert!(!gpx.contains("<trk>"));
    }

    // Test track intersections
    #[test]
    fn test_find_track_intersections_rust() {
        let tracks = vec![
            vec![
                [37.7749, -122.4194],
                [37.7849, -122.4094], // This should be close to the other track
                [37.7949, -122.3994],
            ],
            vec![
                [37.7750, -122.4195], // Very close to first point of track 1
                [37.7850, -122.4095], // Very close to second point of track 1
                [37.7950, -122.3995],
            ],
        ];

        let intersections = find_track_intersections_rust(&tracks, 0.1); // 100m tolerance

        // Should find intersections where tracks are close
        assert!(!intersections.is_empty());

        for (coord, track_indices) in intersections {
            assert!(track_indices.len() >= 2); // Should involve multiple tracks
            assert!(is_valid_coordinate(coord[0], coord[1]));
        }
    }

    #[test]
    fn test_find_track_intersections_no_overlap() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![
                [40.7128, -74.0060], // Far away - no intersection
                [40.7228, -74.0160],
            ],
        ];

        let intersections = find_track_intersections_rust(&tracks, 0.1);
        assert!(intersections.is_empty());
    }

    // Test coverage area calculation
    #[test]
    fn test_calculate_coverage_area_rust() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![[37.7650, -122.4294], [37.7950, -122.3894]],
        ];

        let result = calculate_coverage_area_rust(&tracks);
        assert!(result.is_some());

        let (bbox, area_km2, point_count) = result.unwrap();
        assert_eq!(point_count, 4);
        assert!(area_km2 > 0.0);
        assert!(bbox[0] <= bbox[2]); // min_lat <= max_lat
        assert!(bbox[1] <= bbox[3]); // min_lng <= max_lng
    }

    #[test]
    fn test_calculate_coverage_area_empty() {
        let tracks = vec![];
        let result = calculate_coverage_area_rust(&tracks);
        assert!(result.is_none());
    }

    // Test track clustering
    #[test]
    fn test_cluster_tracks_by_similarity_rust() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![
                [37.7750, -122.4195], // Very similar to track 1
                [37.7850, -122.4095],
            ],
            vec![
                [40.7128, -74.0060], // Different location
                [40.7228, -74.0160],
            ],
        ];

        let clusters = cluster_tracks_by_similarity_rust(&tracks, 0.5); // 500m threshold

        assert!(!clusters.is_empty());

        for (representative, members, similarity) in clusters {
            assert!(!representative.is_empty());
            assert!(!members.is_empty());
            assert!(similarity >= 0.0 && similarity <= 1.0);
        }
    }

    // Test distance calculation
    #[test]
    fn test_calculate_distance_between_points() {
        // Distance between San Francisco and Los Angeles (approximate)
        let distance = calculate_distance_between_points(
            37.7749, -122.4194, // San Francisco
            34.0522, -118.2437, // Los Angeles
        );

        // Should be around 559 km
        assert!(distance > 500.0 && distance < 600.0);
    }

    #[test]
    fn test_calculate_distance_same_point() {
        let distance = calculate_distance_between_points(37.7749, -122.4194, 37.7749, -122.4194);
        assert_eq!(distance, 0.0);
    }

    // Test bounding box calculation
    #[test]
    fn test_get_bounding_box_rust() {
        let coords = vec![
            [37.7749, -122.4194],
            [37.7849, -122.4094],
            [37.7649, -122.4294],
        ];

        let bbox = get_bounding_box_rust(&coords);
        assert_eq!(bbox[0], 37.7649); // min_lat
        assert_eq!(bbox[1], -122.4294); // min_lng
        assert_eq!(bbox[2], 37.7849); // max_lat
        assert_eq!(bbox[3], -122.4094); // max_lng
    }

    #[test]
    fn test_get_bounding_box_single_point() {
        let coords = vec![[37.7749, -122.4194]];
        let bbox = get_bounding_box_rust(&coords);
        assert_eq!(bbox[0], 37.7749);
        assert_eq!(bbox[1], -122.4194);
        assert_eq!(bbox[2], 37.7749);
        assert_eq!(bbox[3], -122.4194);
    }

    // Test track resampling
    #[test]
    fn test_resample_track_rust() {
        let coords = vec![
            [37.7749, -122.4194],
            [37.7799, -122.4144],
            [37.7849, -122.4094],
            [37.7899, -122.4044],
            [37.7949, -122.3994],
        ];

        let resampled = resample_track_rust(&coords, 3);
        assert!(resampled.len() >= 3); // May be 3 or 4 due to including last point
        assert_eq!(resampled[0], coords[0]); // First point should be preserved
        assert_eq!(resampled[resampled.len() - 1], coords[coords.len() - 1]); // Last point should be preserved
    }

    #[test]
    fn test_resample_track_fewer_points_than_target() {
        let coords = vec![[37.7749, -122.4194], [37.7849, -122.4094]];

        let resampled = resample_track_rust(&coords, 5);
        assert_eq!(resampled.len(), 2); // Should return original when target > input
        assert_eq!(resampled, coords);
    }

    #[test]
    fn test_resample_track_empty() {
        let coords = vec![];
        let resampled = resample_track_rust(&coords, 3);
        assert!(resampled.is_empty());
    }

    // Test process_polyline with different inputs
    #[test]
    fn test_process_polyline_json_format() {
        let json_coords = r#"[[37.7749, -122.4194], [37.7849, -122.4094]]"#;
        let result = process_polyline(json_coords);

        assert_eq!(result.len(), 2);
        assert_eq!(result[0], [37.7749, -122.4194]);
        assert_eq!(result[1], [37.7849, -122.4094]);
    }

    #[test]
    fn test_process_polyline_encoded_format() {
        let encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
        let result = process_polyline(encoded);

        // Should decode the polyline
        assert!(!result.is_empty());

        // Validate all coordinates
        for coord in result {
            assert!(is_valid_coordinate(coord[0], coord[1]));
        }
    }

    #[test]
    fn test_process_polyline_invalid_json() {
        let invalid_json = "not valid json";
        let result = process_polyline(invalid_json);

        // Should try to decode as polyline, might be empty for invalid input
        // This tests the fallback behavior
        assert!(result.is_empty() || result.iter().all(|c| is_valid_coordinate(c[0], c[1])));
    }

    #[test]
    fn test_process_polyline_empty_json() {
        let empty_json = "[]";
        let result = process_polyline(empty_json);
        assert!(result.is_empty());
    }

    // Test create_heatmap_from_tracks
    #[test]
    fn test_create_heatmap_from_tracks() {
        let tracks = vec![
            vec![[37.7749, -122.4194], [37.7849, -122.4094]],
            vec![
                [37.7749, -122.4194], // Overlapping segment
                [37.7849, -122.4094],
            ],
            vec![
                [40.7128, -74.0060], // Different area
                [40.7228, -74.0160],
            ],
        ];

        let result = create_heatmap_from_tracks(tracks);

        assert_eq!(result.tracks.len(), 3);
        assert!(result.max_frequency > 0);

        // Check that overlapping tracks have higher frequency
        let overlapping_tracks = result
            .tracks
            .iter()
            .filter(|t| t.coordinates[0][0] > 37.0 && t.coordinates[0][0] < 38.0)
            .collect::<Vec<_>>();

        if overlapping_tracks.len() >= 2 {
            assert!(overlapping_tracks.iter().any(|t| t.frequency > 1));
        }
    }

    #[test]
    fn test_create_heatmap_single_track() {
        let tracks = vec![vec![[37.7749, -122.4194], [37.7849, -122.4094]]];

        let result = create_heatmap_from_tracks(tracks);
        assert_eq!(result.tracks.len(), 1);
        assert_eq!(result.max_frequency, 1);
        assert_eq!(result.tracks[0].frequency, 1);
    }

    #[test]
    fn test_create_heatmap_empty_tracks() {
        let tracks = vec![];
        let result = create_heatmap_from_tracks(tracks);
        assert!(result.tracks.is_empty());
        assert_eq!(result.max_frequency, 1);
    }

    // Test segment key creation
    #[test]
    fn test_create_segment_key() {
        let start = [37.7749, -122.4194];
        let end = [37.7849, -122.4094];

        let key = create_segment_key(start, end);
        assert!(!key.is_empty());
        assert!(key.contains("-"));
        assert!(key.contains(","));

        // Test that reversed segment creates same key (normalized)
        let key_reversed = create_segment_key(end, start);
        assert_eq!(key, key_reversed);
    }

    #[test]
    fn test_create_segment_key_identical_points() {
        let point = [37.7749, -122.4194];
        let key = create_segment_key(point, point);
        assert!(!key.is_empty());
    }

    // Test snap_to_grid
    #[test]
    fn test_snap_to_grid() {
        let point = [37.7749123, -122.4194456];
        let tolerance = 0.001;

        let snapped = snap_to_grid(point, tolerance);

        // Should be rounded to nearest grid point
        assert_eq!(snapped[0], 37.775);
        assert_eq!(snapped[1], -122.419);
    }

    #[test]
    fn test_snap_to_grid_different_tolerance() {
        let point = [37.7749, -122.4194];
        let tolerance = 0.01;

        let snapped = snap_to_grid(point, tolerance);

        assert_eq!(snapped[0], 37.77);
        assert_eq!(snapped[1], -122.42);
    }

    // Test round function edge cases
    #[test]
    fn test_round_precision() {
        assert_eq!(round(37.123456789), 37.12346);
        assert_eq!(round(-122.987654321), -122.98765);
        assert_eq!(round(0.0), 0.0);
        assert_eq!(round(0.000001), 0.00000);
        assert_eq!(round(0.000006), 0.00001);
    }

    // Test is_fit_file edge cases
    #[test]
    fn test_is_fit_file_too_short() {
        let short_data = vec![1, 2, 3, 4, 5];
        assert!(!is_fit_file(&short_data));
    }

    #[test]
    fn test_is_fit_file_wrong_signature() {
        let mut data = vec![0; 12];
        data[8] = b'G';
        data[9] = b'P';
        data[10] = b'X';
        data[11] = b'!';
        assert!(!is_fit_file(&data));
    }

    #[test]
    fn test_is_fit_file_partial_signature() {
        let mut data = vec![0; 12];
        data[8] = b'.';
        data[9] = b'F';
        data[10] = b'I';
        data[11] = b'X'; // Wrong last character
        assert!(!is_fit_file(&data));
    }

    // Test filter_unrealistic_jumps edge cases
    #[test]
    fn test_filter_unrealistic_jumps_single_point() {
        let coords = vec![[37.7749, -122.4194]];
        let filtered = filter_unrealistic_jumps(&coords);
        assert_eq!(filtered, coords);
    }

    #[test]
    fn test_filter_unrealistic_jumps_empty() {
        let coords = vec![];
        let filtered = filter_unrealistic_jumps(&coords);
        assert!(filtered.is_empty());
    }

    #[test]
    fn test_filter_unrealistic_jumps_globe_spanning() {
        let coords = vec![
            [37.7749, -122.4194], // San Francisco
            [-33.8688, 151.2093], // Sydney (globe-spanning jump)
            [37.7849, -122.4094], // Back to SF area
        ];

        let filtered = filter_unrealistic_jumps(&coords);

        // Should filter out the globe-spanning jump
        assert!(filtered.len() < coords.len());
        assert_eq!(filtered[0], coords[0]); // First point should remain
    }

    #[test]
    fn test_filter_unrealistic_jumps_many_consecutive_bad() {
        let mut coords = vec![[37.7749, -122.4194]]; // Start in SF

        // Add many bad points (globe-spanning)
        for i in 0..15 {
            coords.push([80.0 + i as f64, 100.0 + i as f64]);
        }

        // Add a good point back in SF area
        coords.push([37.7849, -122.4094]);

        let filtered = filter_unrealistic_jumps(&coords);

        // Should stop after too many consecutive bad points
        assert!(filtered.len() < coords.len());
        assert_eq!(filtered[0], coords[0]); // First point should remain
    }
}
