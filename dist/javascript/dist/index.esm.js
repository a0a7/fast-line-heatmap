/**
 * fastGeoToolkit - A novel high-performance geospatial analysis framework
 * with advanced route density mapping algorithms
 */
// WebAssembly module import (will be bundled)
let wasmModule = null;
/**
 * Initialize the WebAssembly module
 * Must be called before using any WASM-based functions
 */
async function init() {
    if (wasmModule)
        return;
    try {
        // Dynamic import of the WASM module - path will be resolved at build time
        const wasmInit = await Promise.resolve().then(function () { return fastgeotoolkit; });
        await wasmInit.default();
        wasmModule = wasmInit;
    }
    catch (error) {
        throw new Error(`Failed to initialize WebAssembly module: ${error}`);
    }
}
/**
 * Process GPX files and generate route density heatmap
 * @param files Array of file data as Uint8Array
 * @returns Heatmap result with frequency analysis
 */
async function processGpxFiles(files) {
    await init();
    const fileArray = new Array(files.length);
    files.forEach((file, i) => {
        fileArray[i] = file;
    });
    return wasmModule.process_gpx_files(fileArray);
}
/**
 * Decode Google polyline format to coordinates
 * @param encoded Encoded polyline string
 * @returns Array of coordinates
 */
async function decodePolyline(encoded) {
    await init();
    return wasmModule.decode_polyline_string(encoded);
}
/**
 * Process multiple polylines and generate heatmap
 * @param polylines Array of polyline strings
 * @returns Heatmap result
 */
async function processPolylines(polylines) {
    await init();
    return wasmModule.process_polylines(polylines);
}
/**
 * Validate GPS coordinates
 * @param coordinates Array of coordinates to validate
 * @returns Validation result with issues
 */
async function validateCoordinates(coordinates) {
    await init();
    return wasmModule.validate_coordinates(coordinates);
}
/**
 * Calculate track statistics
 * @param coordinates Track coordinates
 * @returns Statistics including distance and bounding box
 */
async function calculateTrackStatistics(coordinates) {
    await init();
    return wasmModule.calculate_track_statistics(coordinates);
}
/**
 * Simplify track by reducing point density
 * @param coordinates Track coordinates
 * @param tolerance Simplification tolerance
 * @returns Simplified coordinate array
 */
async function simplifyTrack(coordinates, tolerance) {
    await init();
    return wasmModule.simplify_coordinates(coordinates, tolerance);
}
/**
 * Find intersections between multiple tracks
 * @param tracks Array of track coordinate arrays
 * @param tolerance Distance tolerance for intersection detection
 * @returns Intersection points with track indices
 */
async function findTrackIntersections(tracks, tolerance) {
    await init();
    return wasmModule.find_track_intersections(tracks, tolerance);
}
/**
 * Convert coordinates to GeoJSON feature
 * @param coordinates Track coordinates
 * @param properties Optional properties object
 * @returns GeoJSON feature
 */
async function coordinatesToGeojson(coordinates, properties = {}) {
    await init();
    return wasmModule.coordinates_to_geojson(coordinates, properties);
}
/**
 * Export tracks to GPX format
 * @param tracks Array of track coordinate arrays
 * @param metadata Optional metadata
 * @returns GPX file content as string
 */
async function exportToGpx(tracks, metadata = {}) {
    await init();
    return wasmModule.export_to_gpx(tracks, metadata);
}
/**
 * Calculate coverage area of tracks
 * @param tracks Array of track coordinate arrays
 * @returns Coverage information including bounding box and area
 */
async function calculateCoverageArea(tracks) {
    await init();
    return wasmModule.calculate_coverage_area(tracks);
}
/**
 * Get file information from binary data
 * @param fileData File data as Uint8Array
 * @returns File format information
 */
async function getFileInfo(fileData) {
    await init();
    return wasmModule.get_file_info(fileData);
}
/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 First point latitude
 * @param lon1 First point longitude
 * @param lat2 Second point latitude
 * @param lon2 Second point longitude
 * @returns Distance in kilometers
 */
async function calculateDistance(lat1, lon1, lat2, lon2) {
    await init();
    return wasmModule.calculate_distance_between_points(lat1, lon1, lat2, lon2);
}
/**
 * Utilities for working with coordinates without WebAssembly
 */
const utils = {
    /**
     * Check if coordinates are valid (basic validation)
     */
    isValidCoordinate(lat, lon) {
        return (lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180 &&
            !(lat === 0 && lon === 0) &&
            !isNaN(lat) && !isNaN(lon) &&
            isFinite(lat) && isFinite(lon));
    },
    /**
     * Calculate simple distance using Haversine formula (JavaScript implementation)
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },
    /**
     * Calculate bounding box for coordinate array
     */
    getBoundingBox(coordinates) {
        if (coordinates.length === 0) {
            return [0, 0, 0, 0];
        }
        let minLat = coordinates[0][0];
        let maxLat = coordinates[0][0];
        let minLon = coordinates[0][1];
        let maxLon = coordinates[0][1];
        for (const [lat, lon] of coordinates) {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
        }
        return [minLat, minLon, maxLat, maxLon];
    }
};

let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
/**
 * @param {string} encoded
 * @returns {any}
 */
function decode_polyline_string(encoded) {
    const ptr0 = passStringToWasm0(encoded, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decode_polyline_string(ptr0, len0);
    return ret;
}

/**
 * @param {Array<any>} polylines
 * @returns {any}
 */
function process_polylines(polylines) {
    const ret = wasm.process_polylines(polylines);
    return ret;
}

/**
 * @param {Array<any>} files
 * @returns {any}
 */
function process_gpx_files(files) {
    const ret = wasm.process_gpx_files(files);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @returns {any}
 */
function validate_coordinates(coords) {
    const ret = wasm.validate_coordinates(coords);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @param {Array<any>} bounds
 * @returns {any}
 */
function filter_coordinates_by_bounds(coords, bounds) {
    const ret = wasm.filter_coordinates_by_bounds(coords, bounds);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @returns {any}
 */
function calculate_track_statistics(coords) {
    const ret = wasm.calculate_track_statistics(coords);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @param {number} tolerance
 * @returns {any}
 */
function simplify_coordinates(coords, tolerance) {
    const ret = wasm.simplify_coordinates(coords, tolerance);
    return ret;
}

/**
 * @param {Array<any>} tracks
 * @param {number} distance_threshold
 * @returns {any}
 */
function merge_nearby_tracks(tracks, distance_threshold) {
    const ret = wasm.merge_nearby_tracks(tracks, distance_threshold);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @param {number} max_gap_km
 * @param {number} _max_time_gap_seconds
 * @returns {any}
 */
function split_track_by_gaps(coords, max_gap_km, _max_time_gap_seconds) {
    const ret = wasm.split_track_by_gaps(coords, max_gap_km, _max_time_gap_seconds);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @returns {string}
 */
function coordinates_to_polyline(coords) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.coordinates_to_polyline(coords);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {Array<any>} coords
 * @param {any} properties
 * @returns {any}
 */
function coordinates_to_geojson(coords, properties) {
    const ret = wasm.coordinates_to_geojson(coords, properties);
    return ret;
}

/**
 * @param {Array<any>} tracks
 * @param {any} _metadata
 * @returns {string}
 */
function export_to_gpx(tracks, _metadata) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.export_to_gpx(tracks, _metadata);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {Array<any>} tracks
 * @param {number} tolerance
 * @returns {any}
 */
function find_track_intersections(tracks, tolerance) {
    const ret = wasm.find_track_intersections(tracks, tolerance);
    return ret;
}

/**
 * @param {Array<any>} tracks
 * @returns {any}
 */
function calculate_coverage_area(tracks) {
    const ret = wasm.calculate_coverage_area(tracks);
    return ret;
}

/**
 * @param {Array<any>} tracks
 * @param {number} similarity_threshold
 * @returns {any}
 */
function cluster_tracks_by_similarity(tracks, similarity_threshold) {
    const ret = wasm.cluster_tracks_by_similarity(tracks, similarity_threshold);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @returns {any}
 */
function get_bounding_box(coords) {
    const ret = wasm.get_bounding_box(coords);
    return ret;
}

/**
 * @param {Array<any>} coords
 * @param {number} target_point_count
 * @returns {any}
 */
function resample_track(coords, target_point_count) {
    const ret = wasm.resample_track(coords, target_point_count);
    return ret;
}

/**
 * @param {Uint8Array} file_bytes
 * @returns {any}
 */
function get_file_info(file_bytes) {
    const ret = wasm.get_file_info(file_bytes);
    return ret;
}

/**
 * @param {Uint8Array} file_bytes
 * @returns {any}
 */
function extract_file_metadata(file_bytes) {
    const ret = wasm.extract_file_metadata(file_bytes);
    return ret;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_entries_3265d4158b33e5dc = function(arg0) {
        const ret = Object.entries(arg0);
        return ret;
    };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Map_f3469ce2244d2430 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Map;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_a1eab7e0d067391b = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_343e2beeeece1bb0 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_5e0be73521bc8c17 = function() {
        const ret = new Map();
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_8fc6bf8a5b1071d1 = function(arg0, arg1, arg2) {
        const ret = arg0.set(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(arg0) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module);
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
        }
    }

    const imports = __wbg_get_imports();

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('fastgeotoolkit_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

var fastgeotoolkit = /*#__PURE__*/Object.freeze({
    __proto__: null,
    calculate_coverage_area: calculate_coverage_area,
    calculate_track_statistics: calculate_track_statistics,
    cluster_tracks_by_similarity: cluster_tracks_by_similarity,
    coordinates_to_geojson: coordinates_to_geojson,
    coordinates_to_polyline: coordinates_to_polyline,
    decode_polyline_string: decode_polyline_string,
    default: __wbg_init,
    export_to_gpx: export_to_gpx,
    extract_file_metadata: extract_file_metadata,
    filter_coordinates_by_bounds: filter_coordinates_by_bounds,
    find_track_intersections: find_track_intersections,
    get_bounding_box: get_bounding_box,
    get_file_info: get_file_info,
    initSync: initSync,
    merge_nearby_tracks: merge_nearby_tracks,
    process_gpx_files: process_gpx_files,
    process_polylines: process_polylines,
    resample_track: resample_track,
    simplify_coordinates: simplify_coordinates,
    split_track_by_gaps: split_track_by_gaps,
    validate_coordinates: validate_coordinates
});

export { calculateCoverageArea, calculateDistance, calculateTrackStatistics, coordinatesToGeojson, decodePolyline, exportToGpx, findTrackIntersections, getFileInfo, init, processGpxFiles, processPolylines, simplifyTrack, utils, validateCoordinates };
//# sourceMappingURL=index.esm.js.map
