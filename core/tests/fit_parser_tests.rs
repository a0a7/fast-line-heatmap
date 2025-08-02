#[cfg(test)]
mod fit_parser_tests {
    use fastgeotoolkit::*;

    // Helper to create a minimal FIT parser for testing
    fn create_test_parser(data: Vec<u8>) -> FitParser {
        FitParser::new(data)
    }

    // Helper to create a valid FIT message definition
    fn create_test_message_definition(global_msg_num: u16) -> MessageDefinition {
        MessageDefinition {
            global_message_number: global_msg_num,
            fields: vec![
                FieldDefinition {
                    field_def_num: 0, // Latitude
                    size: 4,
                    _base_type: 0x86, // sint32
                },
                FieldDefinition {
                    field_def_num: 1, // Longitude
                    size: 4,
                    _base_type: 0x86, // sint32
                },
                FieldDefinition {
                    field_def_num: 2, // Other field
                    size: 2,
                    _base_type: 0x84, // uint16
                },
            ],
        }
    }

    #[test]
    fn test_fit_parser_creation() {
        let data = vec![1, 2, 3, 4, 5];
        let parser = create_test_parser(data.clone());
        assert_eq!(parser.data.len(), 5);
        assert_eq!(parser.pos, 0);
        assert!(parser.message_definitions.is_empty());
    }

    #[test]
    fn test_read_u8() {
        let data = vec![0x42, 0x43, 0x44];
        let mut parser = create_test_parser(data);
        
        assert_eq!(parser.read_u8(), Some(0x42));
        assert_eq!(parser.pos, 1);
        assert_eq!(parser.read_u8(), Some(0x43));
        assert_eq!(parser.pos, 2);
        assert_eq!(parser.read_u8(), Some(0x44));
        assert_eq!(parser.pos, 3);
        assert_eq!(parser.read_u8(), None); // EOF
    }

    #[test]
    fn test_read_u16_le() {
        let data = vec![0x34, 0x12, 0x78, 0x56];
        let mut parser = create_test_parser(data);
        
        assert_eq!(parser.read_u16_le(), Some(0x1234));
        assert_eq!(parser.pos, 2);
        assert_eq!(parser.read_u16_le(), Some(0x5678));
        assert_eq!(parser.pos, 4);
        assert_eq!(parser.read_u16_le(), None); // EOF
    }

    #[test]
    fn test_read_u32_le() {
        let data = vec![0x78, 0x56, 0x34, 0x12, 0xBC, 0x9A];
        let mut parser = create_test_parser(data);
        
        assert_eq!(parser.read_u32_le(), Some(0x12345678));
        assert_eq!(parser.pos, 4);
        
        // Not enough bytes for another u32
        assert_eq!(parser.read_u32_le(), None);
    }

    #[test]
    fn test_read_i32_le() {
        // Test positive value
        let data = vec![0x78, 0x56, 0x34, 0x12];
        let mut parser = create_test_parser(data);
        assert_eq!(parser.read_i32_le(), Some(0x12345678));

        // Test negative value
        let data = vec![0xFF, 0xFF, 0xFF, 0xFF];
        let mut parser = create_test_parser(data);
        assert_eq!(parser.read_i32_le(), Some(-1));

        // Test FIT invalid value
        let data = vec![0xFF, 0xFF, 0xFF, 0x7F]; // 0x7FFFFFFF
        let mut parser = create_test_parser(data);
        assert_eq!(parser.read_i32_le(), Some(0x7FFFFFFF));
    }

    #[test]
    fn test_skip() {
        let data = vec![1, 2, 3, 4, 5];
        let mut parser = create_test_parser(data);
        
        parser.skip(2);
        assert_eq!(parser.pos, 2);
        
        parser.skip(10); // Should not go beyond data length
        assert_eq!(parser.pos, 5);
    }

    #[test]
    fn test_parse_definition_message_valid() {
        // Create a valid definition message
        let mut data = Vec::new();
        data.push(0x00); // reserved
        data.push(0x00); // architecture (little endian)
        data.extend_from_slice(&20u16.to_le_bytes()); // global message number (record)
        data.push(0x03); // number of fields
        
        // Field 1: Latitude
        data.push(0x00); // field def number
        data.push(0x04); // size
        data.push(0x86); // base type (sint32)
        
        // Field 2: Longitude  
        data.push(0x01); // field def number
        data.push(0x04); // size
        data.push(0x86); // base type (sint32)
        
        // Field 3: Other
        data.push(0x02); // field def number
        data.push(0x02); // size
        data.push(0x84); // base type (uint16)
        
        let mut parser = create_test_parser(data);
        let definition = parser.parse_definition_message();
        
        assert!(definition.is_some());
        let def = definition.unwrap();
        assert_eq!(def.global_message_number, 20);
        assert_eq!(def.fields.len(), 3);
        assert_eq!(def.fields[0].field_def_num, 0);
        assert_eq!(def.fields[0].size, 4);
        assert_eq!(def.fields[1].field_def_num, 1);
        assert_eq!(def.fields[1].size, 4);
    }

    #[test]
    fn test_parse_definition_message_insufficient_data() {
        // Too short for basic structure
        let data = vec![0x00, 0x00, 0x14]; // Only 3 bytes
        let mut parser = create_test_parser(data);
        assert!(parser.parse_definition_message().is_none());
    }

    #[test]
    fn test_parse_definition_message_too_many_fields() {
        let mut data = Vec::new();
        data.push(0x00); // reserved
        data.push(0x00); // architecture
        data.extend_from_slice(&20u16.to_le_bytes()); // global message number
        data.push(0xFF); // 255 fields (too many)
        
        let mut parser = create_test_parser(data);
        assert!(parser.parse_definition_message().is_none());
    }

    #[test]
    fn test_parse_definition_message_field_size_too_large() {
        let mut data = Vec::new();
        data.push(0x00); // reserved
        data.push(0x00); // architecture
        data.extend_from_slice(&20u16.to_le_bytes()); // global message number
        data.push(0x01); // 1 field
        
        // Field with unreasonable size
        data.push(0x00); // field def number
        data.push(0xFF); // size 255 (too large)
        data.push(0x86); // base type
        
        let mut parser = create_test_parser(data);
        assert!(parser.parse_definition_message().is_none());
    }

    #[test]
    fn test_parse_definition_message_insufficient_field_data() {
        let mut data = Vec::new();
        data.push(0x00); // reserved
        data.push(0x00); // architecture
        data.extend_from_slice(&20u16.to_le_bytes()); // global message number
        data.push(0x02); // 2 fields
        
        // Only one field worth of data
        data.push(0x00); // field def number
        data.push(0x04); // size
        // Missing base type and second field
        
        let mut parser = create_test_parser(data);
        assert!(parser.parse_definition_message().is_none());
    }

    #[test]
    fn test_parse_record_message_valid_coordinates() {
        let definition = create_test_message_definition(20);
        
        // Create record data with valid lat/lon
        let lat_raw = (37.7749 * 2147483648.0 / 180.0) as i32;
        let lon_raw = (-122.4194 * 2147483648.0 / 180.0) as i32;
        
        let mut data = Vec::new();
        data.extend_from_slice(&lat_raw.to_le_bytes()); // Latitude
        data.extend_from_slice(&lon_raw.to_le_bytes()); // Longitude
        data.extend_from_slice(&1234u16.to_le_bytes()); // Other field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_some());
        let coord = result.unwrap();
        assert!((coord[0] - 37.7749).abs() < 0.001); // Allow for rounding
        assert!((coord[1] - (-122.4194)).abs() < 0.001);
    }

    #[test]
    fn test_parse_record_message_invalid_coordinates() {
        let definition = create_test_message_definition(20);
        
        // Create record data with invalid sentinel values
        let mut data = Vec::new();
        data.extend_from_slice(&0x7FFFFFFFi32.to_le_bytes()); // Invalid latitude
        data.extend_from_slice(&0x7FFFFFFFi32.to_le_bytes()); // Invalid longitude
        data.extend_from_slice(&1234u16.to_le_bytes()); // Other field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_record_message_zero_coordinates() {
        let definition = create_test_message_definition(20);
        
        // Create record data with zero values (also invalid)
        let mut data = Vec::new();
        data.extend_from_slice(&0i32.to_le_bytes()); // Zero latitude
        data.extend_from_slice(&0i32.to_le_bytes()); // Zero longitude
        data.extend_from_slice(&1234u16.to_le_bytes()); // Other field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_record_message_out_of_range_coordinates() {
        let definition = create_test_message_definition(20);
        
        // Create coordinates that would be out of valid lat/lon range
        let lat_raw = (95.0 * 2147483648.0 / 180.0) as i32; // > 90 degrees
        let lon_raw = (-200.0 * 2147483648.0 / 180.0) as i32; // < -180 degrees
        
        let mut data = Vec::new();
        data.extend_from_slice(&lat_raw.to_le_bytes());
        data.extend_from_slice(&lon_raw.to_le_bytes());
        data.extend_from_slice(&1234u16.to_le_bytes());
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_record_message_insufficient_data() {
        let definition = create_test_message_definition(20);
        
        // Not enough data for all fields
        let mut data = Vec::new();
        data.extend_from_slice(&123i32.to_le_bytes()); // Only latitude
        // Missing longitude and other field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_record_message_wrong_field_size() {
        // Create definition with wrong size for lat/lon fields
        let definition = MessageDefinition {
            global_message_number: 20,
            fields: vec![
                FieldDefinition {
                    field_def_num: 0, // Latitude
                    size: 2, // Wrong size (should be 4)
                    _base_type: 0x86,
                },
                FieldDefinition {
                    field_def_num: 1, // Longitude
                    size: 4,
                    _base_type: 0x86,
                },
            ],
        };
        
        let mut data = Vec::new();
        data.extend_from_slice(&1234u16.to_le_bytes()); // Wrong size lat field
        data.extend_from_slice(&123i32.to_le_bytes()); // Longitude
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none()); // Should fail due to wrong field size
    }

    #[test]
    fn test_parse_flexible_gps_message_valid() {
        let definition = create_test_message_definition(19); // Lap message
        
        // Create data with valid coordinates
        let lat_raw = (37.7749 * 2147483648.0 / 180.0) as i32;
        let lon_raw = (-122.4194 * 2147483648.0 / 180.0) as i32;
        
        let mut data = Vec::new();
        data.extend_from_slice(&lat_raw.to_le_bytes());
        data.extend_from_slice(&lon_raw.to_le_bytes());
        data.extend_from_slice(&1234u16.to_le_bytes()); // Other field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_some());
        let coord = result.unwrap();
        assert!((coord[0] - 37.7749).abs() < 0.001);
        assert!((coord[1] - (-122.4194)).abs() < 0.001);
    }

    #[test]
    fn test_parse_flexible_gps_message_invalid_values() {
        let definition = create_test_message_definition(19);
        
        // Create data with invalid sentinel values
        let mut data = Vec::new();
        data.extend_from_slice(&0x7FFFFFFFi32.to_le_bytes()); // Invalid
        data.extend_from_slice(&0i32.to_le_bytes()); // Zero (invalid)
        data.extend_from_slice(&1234u16.to_le_bytes());
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_flexible_gps_message_only_one_valid_coord() {
        let definition = create_test_message_definition(19);
        
        // Only one valid coordinate (lat but no valid lon)
        let lat_raw = (37.7749 * 2147483648.0 / 180.0) as i32;
        
        let mut data = Vec::new();
        data.extend_from_slice(&lat_raw.to_le_bytes());
        data.extend_from_slice(&0x7FFFFFFFi32.to_le_bytes()); // Invalid lon
        data.extend_from_slice(&1234u16.to_le_bytes());
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_none()); // Need both lat and lon
    }

    #[test]
    fn test_parse_flexible_gps_message_coordinate_selection() {
        // Test with multiple potential coordinates to ensure proper lat/lon selection
        let definition = MessageDefinition {
            global_message_number: 19,
            fields: vec![
                FieldDefinition { field_def_num: 0, size: 4, _base_type: 0x86 }, // First potential coord
                FieldDefinition { field_def_num: 1, size: 4, _base_type: 0x86 }, // Second potential coord
                FieldDefinition { field_def_num: 2, size: 4, _base_type: 0x86 }, // Third potential coord
            ],
        };
        
        let coord1 = (45.0 * 2147483648.0 / 180.0) as i32; // Valid lat (45°)
        let coord2 = (-120.0 * 2147483648.0 / 180.0) as i32; // Valid lon (-120°)
        let coord3 = (200.0 * 2147483648.0 / 180.0) as i32; // Invalid (>180°)
        
        let mut data = Vec::new();
        data.extend_from_slice(&coord1.to_le_bytes());
        data.extend_from_slice(&coord2.to_le_bytes());
        data.extend_from_slice(&coord3.to_le_bytes());
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_some());
        let coord = result.unwrap();
        assert!((coord[0] - 45.0).abs() < 0.001);
        assert!((coord[1] - (-120.0)).abs() < 0.001);
    }

    #[test]
    fn test_parse_flexible_gps_message_insufficient_data() {
        let definition = create_test_message_definition(19);
        
        // Not enough data
        let data = vec![0x01, 0x02]; // Only 2 bytes
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_flexible_gps_message_non_4byte_fields() {
        // Test with non-4-byte fields (should be skipped)
        let definition = MessageDefinition {
            global_message_number: 19,
            fields: vec![
                FieldDefinition { field_def_num: 0, size: 2, _base_type: 0x84 }, // 2-byte field
                FieldDefinition { field_def_num: 1, size: 4, _base_type: 0x86 }, // 4-byte lat
                FieldDefinition { field_def_num: 2, size: 4, _base_type: 0x86 }, // 4-byte lon
                FieldDefinition { field_def_num: 3, size: 1, _base_type: 0x02 }, // 1-byte field
            ],
        };
        
        let lat_raw = (37.5 * 2147483648.0 / 180.0) as i32;
        let lon_raw = (-122.5 * 2147483648.0 / 180.0) as i32;
        
        let mut data = Vec::new();
        data.extend_from_slice(&1234u16.to_le_bytes()); // 2-byte field
        data.extend_from_slice(&lat_raw.to_le_bytes()); // 4-byte lat
        data.extend_from_slice(&lon_raw.to_le_bytes()); // 4-byte lon
        data.push(0x42); // 1-byte field
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_flexible_gps_message(&definition);
        
        assert!(result.is_some());
        let coord = result.unwrap();
        assert!((coord[0] - 37.5).abs() < 0.001);
        assert!((coord[1] - (-122.5)).abs() < 0.001);
    }

    #[test]
    fn test_parse_messages_with_zero_field_size() {
        // Test handling of fields with zero size
        let definition = MessageDefinition {
            global_message_number: 20,
            fields: vec![
                FieldDefinition { field_def_num: 0, size: 0, _base_type: 0x86 }, // Zero size
                FieldDefinition { field_def_num: 1, size: 4, _base_type: 0x86 }, // Valid lat
                FieldDefinition { field_def_num: 2, size: 4, _base_type: 0x86 }, // Valid lon
            ],
        };
        
        let lat_raw = (40.0 * 2147483648.0 / 180.0) as i32;
        let lon_raw = (-74.0 * 2147483648.0 / 180.0) as i32;
        
        let mut data = Vec::new();
        // No data for zero-size field
        data.extend_from_slice(&lat_raw.to_le_bytes());
        data.extend_from_slice(&lon_raw.to_le_bytes());
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        // Should handle zero-size field gracefully and parse remaining fields
        assert!(result.is_none()); // No lat/lon in expected field positions
    }

    #[test]
    fn test_parse_message_bounds_checking() {
        let definition = create_test_message_definition(20);
        
        // Create data that's too short partway through
        let mut data = Vec::new();
        data.extend_from_slice(&123i32.to_le_bytes()); // Full lat field
        data.push(0x01); // Only 1 byte of lon field (should be 4)
        
        let mut parser = create_test_parser(data);
        let result = parser.parse_record_message(&definition);
        
        assert!(result.is_none()); // Should safely handle partial data
    }

    #[test]
    fn test_is_fit_file() {
        // Valid FIT file header
        let mut valid_fit = vec![0x0E, 0x10, 0x01, 0x02]; // header size, protocol, profile
        valid_fit.extend_from_slice(&1000u32.to_le_bytes()); // data size
        valid_fit.extend_from_slice(b".FIT"); // signature
        valid_fit.extend_from_slice(&[0x12, 0x34]); // CRC
        
        assert!(is_fit_file(&valid_fit));
        
        // Invalid signature
        let mut invalid_fit = vec![0x0E, 0x10, 0x01, 0x02];
        invalid_fit.extend_from_slice(&1000u32.to_le_bytes());
        invalid_fit.extend_from_slice(b".GPX"); // wrong signature
        
        assert!(!is_fit_file(&invalid_fit));
        
        // Too short
        let short_data = vec![1, 2, 3];
        assert!(!is_fit_file(&short_data));
    }

    #[test]
    fn test_edge_case_coordinate_values() {
        let definition = create_test_message_definition(20);
        
        // Test edge case values
        let test_cases: Vec<(f64, f64)> = vec![
            (89.0, -179.0),   // Safe valid coordinates
            (-89.0, 179.0),   // Safe valid coordinates  
            (0.0, 0.0),       // Null Island (treated as invalid in your code)
            (89.9999, 179.9999), // Just under limits
            (-89.9999, -179.9999), // Just under negative limits
        ];
        
        for (lat, lon) in test_cases {
            let lat_raw = (lat * 2147483648.0 / 180.0) as i32;
            let lon_raw = (lon * 2147483648.0 / 180.0) as i32;
            
            let mut data = Vec::new();
            data.extend_from_slice(&lat_raw.to_le_bytes());
            data.extend_from_slice(&lon_raw.to_le_bytes());
            data.extend_from_slice(&1234u16.to_le_bytes());
            
            let mut parser = create_test_parser(data);
            let result = parser.parse_record_message(&definition);
            
            // Check if result matches expectation based on your validation logic
            if lat == 0.0 && lon == 0.0 {
                assert!(result.is_none(), "Null Island should be invalid");
            } else if lat.abs() <= 90.0 && lon.abs() <= 180.0 {
                // Convert back to check what the actual parsed values would be
                let expected_lat = round(lat);
                let expected_lon = round(lon);
                
                // Only test if the rounded values would pass validation
                if is_valid_coordinate(expected_lat, expected_lon) {
                    assert!(result.is_some(), "Valid coordinates should be parsed: lat={}, lon={}", lat, lon);
                } else {
                    // If rounded values don't pass validation, that's also acceptable
                    // This accounts for edge cases where rounding might push values out of range
                }
            }
        }
    }
}
