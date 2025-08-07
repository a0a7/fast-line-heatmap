/* tslint:disable */
/* eslint-disable */
export function decode_polyline_string(encoded: string): any;
export function process_polylines(polylines: Array<any>): any;
export function process_gpx_files(files: Array<any>): any;
export function validate_coordinates(coords: Array<any>): any;
export function filter_coordinates_by_bounds(coords: Array<any>, bounds: Array<any>): any;
export function calculate_track_statistics(coords: Array<any>): any;
export function simplify_coordinates(coords: Array<any>, tolerance: number): any;
export function merge_nearby_tracks(tracks: Array<any>, distance_threshold: number): any;
export function split_track_by_gaps(coords: Array<any>, max_gap_km: number, _max_time_gap_seconds: number): any;
export function coordinates_to_polyline(coords: Array<any>): string;
export function coordinates_to_geojson(coords: Array<any>, properties: any): any;
export function export_to_gpx(tracks: Array<any>, _metadata: any): string;
export function find_track_intersections(tracks: Array<any>, tolerance: number): any;
export function calculate_coverage_area(tracks: Array<any>): any;
export function cluster_tracks_by_similarity(tracks: Array<any>, similarity_threshold: number): any;
export function get_bounding_box(coords: Array<any>): any;
export function resample_track(coords: Array<any>, target_point_count: number): any;
export function get_file_info(file_bytes: Uint8Array): any;
export function extract_file_metadata(file_bytes: Uint8Array): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly decode_polyline_string: (a: number, b: number) => any;
  readonly process_polylines: (a: any) => any;
  readonly process_gpx_files: (a: any) => any;
  readonly validate_coordinates: (a: any) => any;
  readonly filter_coordinates_by_bounds: (a: any, b: any) => any;
  readonly calculate_track_statistics: (a: any) => any;
  readonly simplify_coordinates: (a: any, b: number) => any;
  readonly merge_nearby_tracks: (a: any, b: number) => any;
  readonly split_track_by_gaps: (a: any, b: number, c: number) => any;
  readonly coordinates_to_polyline: (a: any) => [number, number];
  readonly coordinates_to_geojson: (a: any, b: any) => any;
  readonly export_to_gpx: (a: any, b: any) => [number, number];
  readonly find_track_intersections: (a: any, b: number) => any;
  readonly calculate_coverage_area: (a: any) => any;
  readonly cluster_tracks_by_similarity: (a: any, b: number) => any;
  readonly get_bounding_box: (a: any) => any;
  readonly resample_track: (a: any, b: number) => any;
  readonly get_file_info: (a: any) => any;
  readonly extract_file_metadata: (a: any) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
