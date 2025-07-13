/**
 * WebAssembly loader script
 * This script helps load the WebAssembly module and provides fallback functionality
 */

// Define global initialization function
window.initRustWasm = async function () {
  try {
    // Check if wasm_bindgen is available and is a function
    if (typeof window.wasm_bindgen === "function") {
      try {
        console.log("Initializing WebAssembly with wasm_bindgen...");
        const wasmModule = await window.wasm_bindgen("/wasm/rust_bg.wasm");

        // Validate that the module has the required functions
        if (
          typeof wasmModule.run_hello_world === "function" &&
          typeof wasmModule.get_sample_code === "function"
        ) {
          console.log("WebAssembly module successfully loaded");
          return wasmModule;
        } else {
          throw new Error(
            "WebAssembly module does not have required functions"
          );
        }
      } catch (bindgenError) {
        console.error("Error initializing WebAssembly:", bindgenError);
        throw bindgenError;
      }
    } else {
      console.warn("wasm_bindgen not found, using fallback");
      throw new Error("wasm_bindgen function not available");
    }
  } catch (error) {
    console.error(
      "Failed to initialize Rust WebAssembly, using fallback:",
      error
    );

    // Return a fallback module with the same interface
    return {
      run_hello_world: function () {
        return "Hello, World from JavaScript fallback! (WebAssembly failed to load)";
      },
      get_sample_code: function () {
        return `fn main() {
    // This is a fallback code sample since WebAssembly failed to load
    println!("Hello, World from Rust!");
    
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }
    
    let result = add(5, 7);
    println!("5 + 7 = {}", result);
}`;
      },
    };
  }
};
