interface Window {
    wasm_bindgen: (wasmPath: string) => Promise<unknown>;
    initRustWasm: () => Promise<unknown>;
}
