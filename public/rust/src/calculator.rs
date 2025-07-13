// Calculator demonstration in Rust
// This file showcases mathematical operations and functions

fn main() {
    println!("Rust Calculator Demo");
    println!("===================");
    
    // Basic arithmetic operations
    let a = 42;
    let b = 7;
    
    println!("Addition: {} + {} = {}", a, b, add(a, b));
    println!("Subtraction: {} - {} = {}", a, b, subtract(a, b));
    println!("Multiplication: {} * {} = {}", a, b, multiply(a, b));
    println!("Division: {} / {} = {}", a, b, divide(a, b));
    
    // More complex operations
    println!("\nAdvanced Operations:");
    println!("Power: {}^3 = {}", a, power(a, 3));
    println!("Square root of 64 = {}", sqrt_approximate(64.0));
    
    // Working with vectors
    let numbers = vec![1, 2, 3, 4, 5];
    println!("\nVector operations:");
    println!("Sum of {:?} = {}", numbers, sum_vector(&numbers));
    println!("Average of {:?} = {:.2}", numbers, average_vector(&numbers));
}

pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn subtract(a: i32, b: i32) -> i32 {
    a - b
}

pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

pub fn divide(a: i32, b: i32) -> i32 {
    if b != 0 {
        a / b
    } else {
        panic!("Division by zero is not allowed!");
    }
}

pub fn power(base: i32, exp: u32) -> i32 {
    base.pow(exp)
}

pub fn sqrt_approximate(n: f64) -> f64 {
    if n < 0.0 {
        panic!("Cannot calculate square root of negative number");
    }
    n.sqrt()
}

pub fn sum_vector(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

pub fn average_vector(numbers: &[i32]) -> f64 {
    if numbers.is_empty() {
        0.0
    } else {
        sum_vector(numbers) as f64 / numbers.len() as f64
    }
}
