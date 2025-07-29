use fastgeotoolkit::{
    decode_polyline, validate_coordinates_rust, 
    calculate_track_statistics_rust, simplify_coordinates_rust
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("fastGeoToolkit Basic Usage Examples");
    println!("====================================");
    
    // Example 1: Decode a polyline
    println!("\n1. Polyline Decoding:");
    let polyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    let coordinates = decode_polyline(polyline);
    println!("Decoded {} points from polyline", coordinates.len());
    
    if !coordinates.is_empty() {
        println!("First point: [{:.6}, {:.6}]", coordinates[0][0], coordinates[0][1]);
        println!("Last point: [{:.6}, {:.6}]", 
                 coordinates[coordinates.len()-1][0], 
                 coordinates[coordinates.len()-1][1]);
    }
    
    // Example 2: Validate coordinates
    println!("\n2. Coordinate Validation:");
    let test_coords = vec![
        [40.7128, -74.0060],  // Valid NYC coordinates
        [91.0, -181.0],       // Invalid coordinates
        [0.0, 0.0],           // Null island (considered invalid)
        [51.5074, -0.1278],   // Valid London coordinates
    ];
    
    let (valid_count, issues) = validate_coordinates_rust(&test_coords);
    println!("Valid coordinates: {}/{}", valid_count, test_coords.len());
    for issue in issues {
        println!("  - {}", issue);
    }
    
    // Example 3: Calculate track statistics
    println!("\n3. Track Statistics:");
    let track = vec![
        [40.7128, -74.0060],  // NYC
        [40.7589, -73.9851],  // Times Square
        [40.7831, -73.9712],  // Central Park
        [40.7505, -73.9934],  // Empire State Building
    ];
    
    if let Some((distance, point_count, bbox)) = calculate_track_statistics_rust(&track) {
        println!("Distance: {:.2} km", distance);
        println!("Points: {}", point_count);
        println!("Bounding box: [{:.4}, {:.4}, {:.4}, {:.4}]", 
                 bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    
    // Example 4: Simplify track
    println!("\n4. Track Simplification:");
    let dense_track: Vec<[f64; 2]> = (0..100)
        .map(|i| [40.0 + i as f64 * 0.001, -74.0 + i as f64 * 0.001])
        .collect();
    
    let simplified = simplify_coordinates_rust(&dense_track, 0.005);
    println!("Original points: {}", dense_track.len());
    println!("Simplified points: {}", simplified.len());
    println!("Reduction: {:.1}%", 
             (1.0 - simplified.len() as f64 / dense_track.len() as f64) * 100.0);
    
    Ok(())
}
