---
title: 'fastGeoToolkit: A High-Performance Geospatial Analysis library with Novel Segment-Based Route Density Mapping'
tags:
  - Geospatial computing
  - heatmap visualization
  - Rust
  - WebAssembly
authors:
  - name: Alexander Weimer
    orcid: 0009-0008-5679-3042
    affiliation: 1
affiliations:
 - name: University of Minnesota
   index: 1
   ror: 017zqws13
date: 30 July 2025
bibliography: paper.bib

---

# Summary

fastGeoToolkit is a high-performance, multi-language geospatial analysis library that introduces a new approach to density mapping and frequency analysis of GPS track data. Unlike traditional heatmap algorithms that lack flexibility and suffer from spatial clustering artifacts, fastGeoToolkit decomposes GPS tracks and applies several processing techniques to identify overlapping route usage patterns with high accuracy.

The library further provides comprehensive GPS track processing capabilities including advanced geospatial operations, track statistics computation, and metadata analysis for common GPS data encoding formats. fastGeoToolkit is performant, being written in rust, but is compiled to support and released as a package for Python and Javascript/Typescript environments.

# Statement of Need

Accurate visualization and analysis of GPS route density is crucial for applications in urban planning, transportation modeling, recreational trail management, and sports analytics. Traditional heatmap approaches based on point density suffer from several limitations:

1. **Poor representation of linear features**: Circular density kernels designed for point data struggle to represent roads, trails and other linear tracks.
2. **Spatial clustering bias**: Point-based methods create artificial hotspots where GPS devices record more frequent position updates, regardless of actual route popularity. Further, variable GPS sampling rates across devices and conditions create non-uniform data density that also distorts route frequency calculations
3. **Scale dependency**: Point-based visualizations often fail to maintain visual accuracy/continuity across different zoom levels and map scales

Existing open-source solutions like QGIS heatmap plugins, R's KernSmooth package, and Python's scipy.stats.gaussian_kde are primarily designed for point data analysis and lack specialized algorithms for linear route features.

Commercial platforms like Strava use proprietary algorithms that are not available for research or custom applications, and are often dependent on computationally heavy server-side preprocessing.

fastGeoToolkit addresses these limitations by introducing a fundamentally different approach that handles GPS tracks as collections of connected segments *without* depending on a preset set of segments (i.e. a road network to 'snap' to), providing more accurate and visually coherent route density representations without tradeoffs.

# Algorithm Characteristics

## Segment-Based Frequency Analysis

The advantage of fastGeoToolkit lies in its segment-based frequency analysis algorithm, which achieves strong performance processing millions of points, even on limited hardware. This algorithm follows 3 steps:

### 1. Track Segmentation and Noise Mitigation
GPS tracks are decomposed into consecutive coordinate pairs representing individual route segments.

To handle GPS measurement noise and slight variations in track recording, coordinates are snapped to a tolerance grid. This process normalizes minor positional differences while preserving route structure. 

### 2. Segment Key Generation and Frequency Counting
Each segment is converted to a directionally-normalized string key to enable efficient overlap detection.

A HashMap maintains usage counts for each unique segment across all input tracks, enabling O(1) lookup performance even for large datasets.

### 3. Track Frequency Calculation
Each track's frequency is calculated as the average usage frequency of its constituent segments:

This approach ensures that route popularity is determined by actual overlapping usage rather than GPS sampling density.

## Performance Characteristics

The algorithm achieves O(n×m) complexity where n is the number of tracks and m is the average track length in segments. HashMap-based segment lookup provides O(1) average-case performance for frequency queries. Memory usage scales linearly with the number of unique segments, typically resulting in significant compression compared to storing full coordinate arrays.

Empirical testing with datasets containing 10,000+ GPS tracks shows strong performance improvements over Python-based implementations, with WebAssembly compilation also achieving high computational efficiency browser environments.

# Multi-Language Architecture

fastGeoToolkit employs a multi-layer architecture that maximizes performance while ensuring broad accessibility:

## Core Implementation (Rust)
The algorithmic core is implemented in Rust, and enables:
- Memory safety
- Native compilation for optimal CPU instruction utilization
- Parallelization support via Rayon

## WebAssembly Compilation
The Rust core compiles to WebAssembly using wasm-pack, enabling:
- Browser-native execution without server dependencies
- Near-native performance in web applications
- Cross-platform compatibility across operating systems
- Integration with JavaScript mapping libraries like Leaflet and Mapbox/MaplibreGL.

## Package Management Integration
fastGeoToolkit integrates with standard package managers under the `fastGeoToolkit` namespace across target ecosystems:
- **Rust** - crates.io (installation via cargo)
- **JavaScript/TypeScript** - NPM
- **Python** - PyPI (installation via pip)

# Conclusion

fastGeoToolkit addresses fundamental limitations in existing GPS route analysis tools by introducing a novel segment-based approach to route density mapping. The library's high-performance Rust implementation and multi-language bindings make advanced geospatial algorithms accessible to diverse communities.

The segment-based frequency analysis algorithm provides more accurate route popularity visualization compared to traditional point-based methods, particularly for GPS data. This accuracy improvement, combined with the library's cross-platform availability and consistent API design, supports reproducible workflows across programming ecosystems.

# Acknowledgements

The authors acknowledge the contributions of the open-source geospatial community.

# References