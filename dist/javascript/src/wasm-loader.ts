/**
 * WASM module initialization utilities
 */

/**
 * Initialize fastgeotoolkit with automatic WASM loading
 * This is a convenience function that handles WASM loading automatically
 */
export async function initWithWasm(): Promise<any> {
  try {
    // Use eval to make the import completely dynamic and avoid bundler resolution issues
    const importFunc = new Function('path', 'return import(path)');
    const wasmModule = await importFunc('fastgeotoolkit/wasm');
    
    // Initialize the WASM module
    if (typeof wasmModule.default === 'function') {
      await wasmModule.default();
    }
    
    return wasmModule;
  } catch (error) {
    throw new Error(`Failed to initialize WASM module: ${error}`);
  }
}

/**
 * Load WASM from URL
 */
export async function loadWasmFromUrl(wasmJsUrl: string, wasmBgUrl?: string): Promise<any> {
  try {
    const response = await fetch(wasmJsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM JS module: ${response.status}`);
    }
    
    const moduleText = await response.text();
    const moduleBlob = new Blob([moduleText], { type: 'application/javascript' });
    const moduleUrl = URL.createObjectURL(moduleBlob);
    
    const wasmModule = await import(/* @vite-ignore */ moduleUrl);
    
    if (wasmBgUrl) {
      await wasmModule.default(wasmBgUrl);
    } else {
      await wasmModule.default();
    }
    
    URL.revokeObjectURL(moduleUrl);
    
    return wasmModule;
  } catch (error) {
    throw new Error(`Failed to load WASM from URL: ${error}`);
  }
}
