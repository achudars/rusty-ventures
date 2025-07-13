/**
 * Utility function to load WebAssembly modules in Next.js
 * Handles graceful fallbacks when WASM files are not available
 */
export const loadWasmModule = async () => {
  // When running on the server side (during SSR), return null
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Try to fetch the WASM file to check if it exists
    const response = await fetch('/wasm/rust.js');
    if (!response.ok) {
      throw new Error('WASM file not found');
    }
    
    // If file exists, dynamically create script tag to load it
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        try {
          import('/wasm/rust.js').then(module => {
            window.wasmModule = module;
            window.dispatchEvent(new CustomEvent('wasmModuleLoaded', { detail: module }));
          }).catch(error => {
            window.dispatchEvent(new CustomEvent('wasmModuleError', { detail: error }));
          });
        } catch (error) {
          window.dispatchEvent(new CustomEvent('wasmModuleError', { detail: error }));
        }
      `;
      
      document.head.appendChild(script);
      
      const handleLoad = (event: CustomEvent) => {
        resolve(event.detail);
      };
      
      const handleError = (event: CustomEvent) => {
        console.warn('WASM module loading failed:', event.detail);
        // Return fallback implementation
        resolve({
          default: async () => {},
          run_hello_world: () => 'Hello from fallback implementation! WASM not available.',
          get_sample_code: () => '// Fallback Rust code - WASM not loaded'
        });
      };
      
      window.addEventListener('wasmModuleLoaded', handleLoad as EventListener, { once: true });
      window.addEventListener('wasmModuleError', handleError as EventListener, { once: true });
      
      // Timeout fallback
      setTimeout(() => {
        handleError({ detail: 'Timeout' } as CustomEvent);
      }, 5000);
    });
    
  } catch (error) {
    console.warn('WASM module not available, using fallback implementation:', error);
    // Return fallback implementation
    return {
      default: async () => {},
      run_hello_world: () => 'Hello from fallback implementation! WASM not available.',
      get_sample_code: () => '// Fallback Rust code - WASM not loaded'
    };
  }
};
