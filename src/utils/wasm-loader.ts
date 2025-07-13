/**
 * Utility function to load WebAssembly modules in Next.js
 */
export const loadWasmModule = async () => {
  try {
    // When running on the client side
    if (typeof window !== 'undefined') {
      // Import the module from the public directory
      const rustModule = await import('/wasm/rust.js');
      return rustModule;
    }
    // When running on the server side (during SSR)
    return null;
  } catch (error) {
    console.error('Error loading WebAssembly module:', error);
    throw error;
  }
};
