declare module "/wasm/rust.js" {
  export function run_hello_world(): string;
  export function get_sample_code(): string;
}

declare module "/wasm/rust_bg.wasm" {
  export function run_hello_world(): string;
  export function get_sample_code(): string;
}
