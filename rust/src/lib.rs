use wasm_bindgen::prelude::*;

// Executes the hello.rs main() logic and returns the full console output
#[wasm_bindgen]
pub fn run_hello_world() -> String {
    let mut output: Vec<String> = Vec::new();

    output.push("Hello from Rust Ventures!".to_string());
    output.push("Rust is running in WebAssembly!".to_string());

    output.push(String::new());
    output.push("Let's calculate some squares:".to_string());
    for i in 1..=5_i32 {
        output.push(format!("{} squared is {}", i, i * i));
    }

    let languages = vec!["Rust", "JavaScript", "WebAssembly"];
    output.push(String::new());
    output.push(format!(
        "Languages used in this project: {}",
        languages.join(", ")
    ));

    output.push(String::new());
    output.push("This code is executed using wasm-pack - Rust in WebAssembly".to_string());

    output.join("\n")
}

// Returns the source of hello.rs for display in the editor
#[wasm_bindgen]
pub fn get_sample_code() -> String {
    r#"// Simple Rust program to demonstrate Rust running in WebAssembly
// Click the play button to execute this code

fn main() {
    println!("Hello from Rust Ventures!");
    println!("Rust is running in WebAssembly!");

    println!("\nLet's calculate some squares:");
    for i in 1..=5 {
        println!("{} squared is {}", i, i * i);
    }

    let languages = vec!["Rust", "JavaScript", "WebAssembly"];
    println!("\nLanguages used in this project: {}", languages.join(", "));

    println!("\nThis code is executed using wasm-pack - Rust in WebAssembly");
}"#
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = run_hello_world();
        assert!(result.contains("Hello from Rust Ventures!"));
        assert!(result.contains("1 squared is 1"));
        assert!(result.contains("Languages used in this project: Rust, JavaScript, WebAssembly"));
    }
}
