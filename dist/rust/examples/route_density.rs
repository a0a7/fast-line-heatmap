use fastgeotoolkit::{
    create_heatmap_from_tracks, find_track_intersections_rust,
    cluster_tracks_by_similarity_rust, calculate_coverage_area_rust
};

fn main() {
    println!("fastGeoToolkit Route Density Analysis");
    println!("====================================");
    
    // Sample GPS tracks representing popular routes in a city
    let tracks = vec![
        // Main street route (high frequency)
        vec![
            [40.7128, -74.0060],
            [40.7200, -74.0040],
            [40.7280, -74.0020],
            [40.7360, -74.0000],
        ],
        // Parallel route (medium frequency)
        vec![
            [40.7120, -74.0050],
            [40.7190, -74.0030],
            [40.7270, -74.0010],
            [40.7350, -73.9990],
        ],
        // Cross street (creates intersections)
        vec![
            [40.7250, -74.0080],
            [40.7250, -74.0040],
            [40.7250, -74.0000],
            [40.7250, -73.9960],
        ],
        // Repeat of main street (increases frequency)
        vec![
            [40.7128, -74.0060],
            [40.7200, -74.0040],
            [40.7280, -74.0020],
        ],
    ];
    
    // Example 1: Generate route density heatmap
    println!("\n1. Route Density Analysis:");
    let heatmap = create_heatmap_from_tracks(tracks.clone());
    println!("Generated heatmap with {} tracks", heatmap.tracks.len());
    println!("Maximum frequency: {}", heatmap.max_frequency);
    
    for (i, track) in heatmap.tracks.iter().enumerate() {
        println!("  Track {}: {} points, frequency {}", 
                 i + 1, track.coordinates.len(), track.frequency);
    }
    
    // Example 2: Find intersections
    println!("\n2. Intersection Detection:");
    let intersections = find_track_intersections_rust(&tracks, 0.001); // ~100m tolerance
    println!("Found {} intersection points", intersections.len());
    
    for (i, (coord, track_indices)) in intersections.iter().enumerate() {
        println!("  Intersection {}: [{:.4}, {:.4}] between tracks {:?}", 
                 i + 1, coord[0], coord[1], track_indices);
    }
    
    // Example 3: Cluster similar tracks
    println!("\n3. Track Clustering:");
    let clusters = cluster_tracks_by_similarity_rust(&tracks, 0.7); // 70% similarity threshold
    println!("Found {} clusters", clusters.len());
    
    for (i, (representative, members, similarity)) in clusters.iter().enumerate() {
        println!("  Cluster {}: {} members, similarity {:.2}", 
                 i + 1, members.len(), similarity);
        println!("    Representative track: {} points", representative.len());
        println!("    Members: {:?}", members);
    }
    
    // Example 4: Coverage analysis
    println!("\n4. Coverage Analysis:");
    if let Some((bbox, area_km2, point_count)) = calculate_coverage_area_rust(&tracks) {
        println!("Geographic coverage:");
        println!("  Bounding box: [{:.4}, {:.4}, {:.4}, {:.4}]", 
                 bbox[0], bbox[1], bbox[2], bbox[3]);
        println!("  Area: {:.2} km²", area_km2);
        println!("  Total points: {}", point_count);
        
        let density = point_count as f64 / area_km2;
        println!("  Point density: {:.1} points/km²", density);
    }
    
    // Example 5: Advanced heatmap analysis
    println!("\n5. Advanced Analysis:");
    analyze_route_popularity(&heatmap);
}

fn analyze_route_popularity(heatmap: &fastgeotoolkit::HeatmapResult) {
    let total_tracks = heatmap.tracks.len();
    let mut frequency_distribution = std::collections::HashMap::new();
    
    // Calculate frequency distribution
    for track in &heatmap.tracks {
        *frequency_distribution.entry(track.frequency).or_insert(0) += 1;
    }
    
    println!("Route popularity distribution:");
    let mut frequencies: Vec<_> = frequency_distribution.keys().collect();
    frequencies.sort();
    
    for &freq in frequencies {
        let count = frequency_distribution[&freq];
        let percentage = (count as f64 / total_tracks as f64) * 100.0;
        println!("  Frequency {}: {} tracks ({:.1}%)", freq, count, percentage);
    }
    
    // Identify most popular routes
    let max_freq = heatmap.max_frequency;
    let popular_tracks: Vec<_> = heatmap.tracks.iter()
        .enumerate()
        .filter(|(_, track)| track.frequency == max_freq)
        .collect();
    
    println!("\nMost popular routes ({} with max frequency {}):", 
             popular_tracks.len(), max_freq);
    for (i, track) in popular_tracks {
        println!("  Track {}: {} points", i + 1, track.coordinates.len());
    }
}
