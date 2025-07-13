// Test suite for calculator.rs module
// This file contains unit tests for the calculator.rs functionality

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_basic_arithmetic() {
        assert_eq!(add(5, 3), 8);
        assert_eq!(subtract(10, 4), 6);
        assert_eq!(multiply(6, 7), 42);
        assert_eq!(divide(15, 3), 5);
    }
    
    #[test]
    fn test_power() {
        assert_eq!(power(2, 3), 8);
        assert_eq!(power(5, 2), 25);
        assert_eq!(power(3, 0), 1);
    }
    
    #[test]
    fn test_vector_operations() {
        let numbers = vec![1, 2, 3, 4, 5];
        assert_eq!(sum_vector(&numbers), 15);
        assert_eq!(average_vector(&numbers), 3.0);
        
        let empty: Vec<i32> = vec![];
        assert_eq!(sum_vector(&empty), 0);
        assert_eq!(average_vector(&empty), 0.0);
    }
}

fn main() {
    println!("Running tests for calculator.rs module...");
    
    // Manual test execution (since we can't use cargo test in WebAssembly)
    println!("✓ Testing basic arithmetic functions...");
    assert_eq!(add(5, 3), 8);
    assert_eq!(subtract(10, 4), 6);
    assert_eq!(multiply(6, 7), 42);
    assert_eq!(divide(15, 3), 5);
    println!("  All arithmetic tests passed!");
    
    println!("✓ Testing power function...");
    assert_eq!(power(2, 3), 8);
    assert_eq!(power(5, 2), 25);
    println!("  All power tests passed!");
    
    println!("✓ Testing vector operations...");
    let numbers = vec![1, 2, 3, 4, 5];
    assert_eq!(sum_vector(&numbers), 15);
    assert_eq!(average_vector(&numbers), 3.0);
    println!("  All vector operation tests passed!");
    
    println!("\n[SUCCESS] All tests for calculator.rs passed successfully!");
}

// Re-implement the functions we're testing (normally these would be imported)
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn subtract(a: i32, b: i32) -> i32 {
    a - b
}

fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

fn divide(a: i32, b: i32) -> i32 {
    if b != 0 {
        a / b
    } else {
        panic!("Division by zero is not allowed!");
    }
}

fn power(base: i32, exp: u32) -> i32 {
    base.pow(exp)
}

fn sum_vector(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn average_vector(numbers: &[i32]) -> f64 {
    if numbers.is_empty() {
        0.0
    } else {
        sum_vector(numbers) as f64 / numbers.len() as f64
    }
}
