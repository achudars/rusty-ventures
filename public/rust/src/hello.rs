// Simple Rust program to demonstrate Rust running in WebAssembly
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
}

// Function to demonstrate basic addition
pub fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

// Function to calculate factorial
pub fn factorial(n: u32) -> u32 {
    match n {
        0 | 1 => 1,
        _ => n * factorial(n - 1),
    }
}
