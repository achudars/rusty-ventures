use wasm_bindgen::prelude::*;

// This is the main function that will be executed when the Play button is clicked
#[wasm_bindgen]
pub fn run_hello_world() -> String {
    "Hello, World from Rust via WebAssembly!".to_string()
}

// Function to return the sample code as a string for display purposes
#[wasm_bindgen]
pub fn get_sample_code() -> String {
    r#"fn main() {
    println!("Hello, World from Rust via WebAssembly!");
}"#.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = run_hello_world();
        assert!(result.contains("Hello, World"));
    }
}
