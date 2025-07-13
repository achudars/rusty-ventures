/**
 * Fallback module for development - will be replaced by wasm-pack build
 * This uses UMD format to be compatible with various module systems
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node. Export as module
    module.exports = factory();
  } else {
    // Browser globals
    root.rustFallback = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return {
    run_hello_world: function () {
      return "Hello, World from Rust via JavaScript fallback!";
    },
    get_sample_code: function () {
      return `fn main() {
    println!("Hello, World from Rust via WebAssembly!");
}`;
    },
  };
});
