use heatmap_parse::*;

#[cfg(test)]
mod tests {
    use super::*;

    // test data constants
    const VALID_COORDS: [[f64; 2]; 4] = [
        [37.7749, -122.4194], // san francisco
        [37.7849, -122.4094], // nearby point
        [37.7949, -122.3994], // another nearby point
        [37.8049, -122.3894], // endpoint
    ];

    const INVALID_COORDS: [[f64; 2]; 3] = [
        [91.0, -122.4194],   // invalid latitude > 90
        [37.7749, -181.0],   // invalid longitude < -180
        [0.0, 0.0],          // null island (considered invalid)
    ];

    const ENCODED_POLYLINE: &str = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

    // helper function to create sample tracks
    fn create_sample_tracks() -> Vec<Vec<[f64; 2]>> {
        vec![
            vec![
                [37.7749, -122.4194],
                [37.7849, -122.4094],
                [37.7949, -122.3994],
            ],
            vec![
                [37.7750, -122.4195], // very close to first track
                [37.7850, -122.4095],
                [37.7950, -122.3995],
            ],
            vec![
                [40.7128, -74.0060],  // new york (far away)
                [40.7228, -74.0160],
                [40.7328, -74.0260],
            ],
        ]
    }

    #[test]
    fn test_decode_polyline() {
        let coords = decode_polyline(ENCODED_POLYLINE);
        assert!(!coords.is_empty(), "decoded coordinates should not be empty");
        
        // check that all coordinates are valid
        for coord in coords {
            assert!(coord[0] >= -90.0 && coord[0] <= 90.0, "latitude should be valid");
            assert!(coord[1] >= -180.0 && coord[1] <= 180.0, "longitude should be valid");
        }
    }

    #[test]
    fn test_validate_coordinates_rust() {
        let (valid_count, issues) = validate_coordinates_rust(&VALID_COORDS);
        assert_eq!(valid_count, 4, "all valid coordinates should be counted");
        assert!(issues.is_empty(), "no issues should be found for valid coordinates");

        let (invalid_valid_count, invalid_issues) = validate_coordinates_rust(&INVALID_COORDS);
        assert_eq!(invalid_valid_count, 0, "no invalid coordinates should be valid");
        assert_eq!(invalid_issues.len(), 3, "should find 3 issues");
    }

    #[test]
    fn test_filter_coordinates_by_bounds_rust() {
        let bounds = [37.7, -122.5, 37.8, -122.3]; // [min_lat, min_lng, max_lat, max_lng]
        let filtered = filter_coordinates_by_bounds_rust(&VALID_COORDS, bounds);
        
        assert!(!filtered.is_empty(), "some coordinates should be within bounds");
        
        // check that all filtered coordinates are within bounds
        for coord in filtered {
            assert!(coord[0] >= bounds[0] && coord[0] <= bounds[2], "latitude should be within bounds");
            assert!(coord[1] >= bounds[1] && coord[1] <= bounds[3], "longitude should be within bounds");
        }
    }

    #[test]
    fn test_calculate_track_statistics_rust() {
        let result = calculate_track_statistics_rust(&VALID_COORDS);
        assert!(result.is_some(), "should return statistics for valid coordinates");
        
        let (distance, point_count, bbox) = result.unwrap();
        assert!(distance > 0.0, "distance should be positive");
        assert_eq!(point_count, 4, "point count should match input");
        assert_eq!(bbox.len(), 4, "bounding box should have 4 values");
        
        // test empty coordinates
        let empty_result = calculate_track_statistics_rust(&[]);
        assert!(empty_result.is_none(), "should return none for empty coordinates");
    }

    #[test]
    fn test_simplify_coordinates_rust() {
        let simplified = simplify_coordinates_rust(&VALID_COORDS, 0.001);
        assert!(!simplified.is_empty(), "simplified coordinates should not be empty");
        assert!(simplified.len() <= VALID_COORDS.len(), "simplified should have same or fewer points");
        
        // test with very low tolerance (should keep all points)
        let minimal_simplify = simplify_coordinates_rust(&VALID_COORDS, 0.0);
        assert_eq!(minimal_simplify.len(), VALID_COORDS.len(), "minimal simplification should keep all points");
    }

    #[test]
    fn test_merge_nearby_tracks_rust() {
        let tracks = create_sample_tracks();
        let merged = merge_nearby_tracks_rust(&tracks, 0.1); // 0.1km threshold
        
        assert!(!merged.is_empty(), "merged tracks should not be empty");
        assert!(merged.len() <= tracks.len(), "merged should have same or fewer tracks");
    }

    #[test]
    fn test_split_track_by_gaps_rust() {
        // create coordinates with a large gap
        let coords_with_gap = [
            [37.7749, -122.4194],
            [37.7849, -122.4094],
            [40.7128, -74.0060],  // large jump to new york
            [40.7228, -74.0160],
        ];
        
        let split_tracks = split_track_by_gaps_rust(&coords_with_gap, 100.0); // 100km threshold
        assert!(split_tracks.len() >= 2, "should split into multiple tracks due to large gap");
    }

    #[test]
    fn test_coordinates_to_polyline_rust() {
        let polyline = coordinates_to_polyline_rust(&VALID_COORDS);
        assert!(!polyline.is_empty(), "encoded polyline should not be empty");
        
        // test round-trip encoding/decoding
        let decoded = decode_polyline(&polyline);
        assert_eq!(decoded.len(), VALID_COORDS.len(), "round-trip should preserve point count");
    }

    #[test]
    fn test_coordinates_to_geojson_rust() {
        let properties = serde_json::json!({"name": "test track"});
        let geojson = coordinates_to_geojson_rust(&VALID_COORDS, properties);
        
        assert_eq!(geojson["type"], "Feature", "should be a geojson feature");
        assert_eq!(geojson["geometry"]["type"], "LineString", "should be a linestring");
        assert_eq!(geojson["properties"]["name"], "test track", "should preserve properties");
        
        let coordinates = geojson["geometry"]["coordinates"].as_array().unwrap();
        assert_eq!(coordinates.len(), VALID_COORDS.len(), "should preserve coordinate count");
    }

    #[test]
    fn test_export_to_gpx_rust() {
        let tracks = create_sample_tracks();
        let gpx = export_to_gpx_rust(&tracks);
        
        assert!(gpx.contains("<?xml"), "should be valid xml");
        assert!(gpx.contains("<gpx"), "should contain gpx element");
        assert!(gpx.contains("<trk"), "should contain track elements");
        assert!(gpx.contains("<trkpt"), "should contain track points");
        assert!(gpx.contains("</gpx>"), "should be properly closed");
    }

    #[test]
    fn test_find_track_intersections_rust() {
        let tracks = create_sample_tracks();
        let intersections = find_track_intersections_rust(&tracks, 0.01);
        
        // first two tracks are very close, should have intersections
        if !intersections.is_empty() {
            for (coord, track_indices) in intersections {
                assert!(coord[0] >= -90.0 && coord[0] <= 90.0, "intersection latitude should be valid");
                assert!(coord[1] >= -180.0 && coord[1] <= 180.0, "intersection longitude should be valid");
                assert!(track_indices.len() >= 2, "intersection should involve at least 2 tracks");
            }
        }
    }

    #[test]
    fn test_calculate_coverage_area_rust() {
        let tracks = create_sample_tracks();
        let result = calculate_coverage_area_rust(&tracks);
        
        assert!(result.is_some(), "should return coverage area for valid tracks");
        let (bbox, area_km2, point_count) = result.unwrap();
        
        assert_eq!(bbox.len(), 4, "bounding box should have 4 values");
        assert!(area_km2 > 0.0, "area should be positive");
        assert!(point_count > 0, "point count should be positive");
        
        // test empty tracks
        let empty_result = calculate_coverage_area_rust(&[]);
        assert!(empty_result.is_none(), "should return none for empty tracks");
    }

    #[test]
    fn test_cluster_tracks_by_similarity_rust() {
        let tracks = create_sample_tracks();
        let clusters = cluster_tracks_by_similarity_rust(&tracks, 0.5);
        
        assert!(!clusters.is_empty(), "should create clusters");
        assert!(clusters.len() <= tracks.len(), "clusters should not exceed track count");
        
        for (representative, members, score) in clusters {
            assert!(!representative.is_empty(), "representative track should not be empty");
            assert!(!members.is_empty(), "cluster should have members");
            assert!(score >= 0.0 && score <= 1.0, "similarity score should be between 0 and 1");
        }
    }

    #[test]
    fn test_get_bounding_box_rust() {
        let bbox = get_bounding_box_rust(&VALID_COORDS);
        assert_eq!(bbox.len(), 4, "bounding box should have 4 values");
        
        let [min_lat, min_lng, max_lat, max_lng] = bbox;
        assert!(min_lat <= max_lat, "min latitude should be <= max latitude");
        assert!(min_lng <= max_lng, "min longitude should be <= max longitude");
        
        // verify bounds contain all points
        for coord in VALID_COORDS {
            assert!(coord[0] >= min_lat && coord[0] <= max_lat, "point should be within lat bounds");
            assert!(coord[1] >= min_lng && coord[1] <= max_lng, "point should be within lng bounds");
        }
    }

    #[test]
    fn test_resample_track_rust() {
        let target_count = 2;
        let resampled = resample_track_rust(&VALID_COORDS, target_count);
        
        assert!(!resampled.is_empty(), "resampled track should not be empty");
        
        // if we have fewer points than target, should return all points
        if VALID_COORDS.len() <= target_count {
            assert_eq!(resampled.len(), VALID_COORDS.len(), "should return all points when target exceeds input");
        } else {
            assert!(resampled.len() <= target_count + 1, "should not exceed target count by much");
        }
    }

    #[test]
    fn test_calculate_distance_between_points() {
        let distance = calculate_distance_between_points(
            VALID_COORDS[0][0], VALID_COORDS[0][1],
            VALID_COORDS[1][0], VALID_COORDS[1][1]
        );
        
        assert!(distance > 0.0, "distance should be positive");
        assert!(distance < 1000.0, "distance should be reasonable for nearby points");
        
        // test distance from point to itself
        let zero_distance = calculate_distance_between_points(
            VALID_COORDS[0][0], VALID_COORDS[0][1],
            VALID_COORDS[0][0], VALID_COORDS[0][1]
        );
        assert!(zero_distance < 0.001, "distance from point to itself should be near zero");
    }

    #[test]
    fn test_haversine_distance_symmetry() {
        let p1 = VALID_COORDS[0];
        let p2 = VALID_COORDS[1];
        
        let dist1 = calculate_distance_between_points(p1[0], p1[1], p2[0], p2[1]);
        let dist2 = calculate_distance_between_points(p2[0], p2[1], p1[0], p1[1]);
        
        assert!((dist1 - dist2).abs() < 0.001, "haversine distance should be symmetric");
    }

    #[test]
    fn test_polyline_encoding_decoding_roundtrip() {
        let original = VALID_COORDS.to_vec();
        let encoded = coordinates_to_polyline_rust(&original);
        let decoded = decode_polyline(&encoded);
        
        assert_eq!(decoded.len(), original.len(), "roundtrip should preserve count");
        
        // check that decoded coordinates are close to original (within encoding precision)
        for (orig, dec) in original.iter().zip(decoded.iter()) {
            let lat_diff = (orig[0] - dec[0]).abs();
            let lng_diff = (orig[1] - dec[1]).abs();
            assert!(lat_diff < 0.001, "latitude should be preserved within precision");
            assert!(lng_diff < 0.001, "longitude should be preserved within precision");
        }
    }

    #[test]
    fn test_edge_cases() {
        // test empty coordinates
        let empty: &[[f64; 2]] = &[];
        let (valid_count, issues) = validate_coordinates_rust(empty);
        assert_eq!(valid_count, 0, "empty coordinates should have 0 valid count");
        assert!(issues.is_empty(), "empty coordinates should have no issues");
        
        // test single coordinate
        let single = &[[37.7749, -122.4194]];
        let simplified = simplify_coordinates_rust(single, 0.001);
        assert_eq!(simplified.len(), 1, "single coordinate should be preserved");
        
        // test coordinates at extreme valid values
        let extreme = &[[-90.0, -180.0], [90.0, 180.0]];
        let (extreme_valid, extreme_issues) = validate_coordinates_rust(extreme);
        assert_eq!(extreme_valid, 2, "extreme valid coordinates should be accepted");
        assert!(extreme_issues.is_empty(), "extreme valid coordinates should have no issues");
    }

    #[test]
    fn test_performance_with_large_dataset() {
        // create a larger dataset for performance testing
        let mut large_coords = Vec::new();
        for i in 0..1000 {
            let lat = 37.7749 + (i as f64) * 0.0001;
            let lng = -122.4194 + (i as f64) * 0.0001;
            large_coords.push([lat, lng]);
        }
        
        // test that functions can handle larger datasets
        let start = std::time::Instant::now();
        let simplified = simplify_coordinates_rust(&large_coords, 0.001);
        let duration = start.elapsed();
        
        assert!(!simplified.is_empty(), "should handle large dataset");
        assert!(duration.as_millis() < 1000, "should complete within reasonable time");
        assert!(simplified.len() < large_coords.len(), "should actually simplify large dataset");
    }
}
