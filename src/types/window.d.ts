interface Window {
    wasm_bindgen: (wasmPath: string) => Promise<unknown>;
    initRustWasm: () => Promise<unknown>;
    wasmModule?: {
        default: (wasmPath: string) => Promise<void>;
        run_hello_world: () => string;
        get_sample_code: () => string;
    };
}
