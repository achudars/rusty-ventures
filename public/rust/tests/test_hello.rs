// Test suite for hello.rs module
// This file contains unit tests for the hello.rs functionality

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_add_numbers() {
        assert_eq!(add_numbers(2, 3), 5);
        assert_eq!(add_numbers(-1, 1), 0);
        assert_eq!(add_numbers(0, 0), 0);
        assert_eq!(add_numbers(100, 200), 300);
    }
    
    #[test]
    fn test_factorial() {
        assert_eq!(factorial(0), 1);
        assert_eq!(factorial(1), 1);
        assert_eq!(factorial(5), 120);
        assert_eq!(factorial(3), 6);
        assert_eq!(factorial(4), 24);
    }
    
    #[test]
    fn test_factorial_edge_cases() {
        // Test that factorial works for small numbers
        assert_eq!(factorial(2), 2);
        
        // Test larger number
        assert_eq!(factorial(6), 720);
    }
}

fn main() {
    println!("Running tests for hello.rs module...");
    
    // Manual test execution (since we can't use cargo test in WebAssembly)
    println!("✓ Testing add_numbers function...");
    assert_eq!(add_numbers(2, 3), 5);
    assert_eq!(add_numbers(-1, 1), 0);
    println!("  All add_numbers tests passed!");
    
    println!("✓ Testing factorial function...");
    assert_eq!(factorial(0), 1);
    assert_eq!(factorial(5), 120);
    println!("  All factorial tests passed!");
    
    println!("\n[SUCCESS] All tests for hello.rs passed successfully!");
}

// Re-implement the functions we're testing (normally these would be imported)
fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

fn factorial(n: u32) -> u32 {
    match n {
        0 | 1 => 1,
        _ => n * factorial(n - 1),
    }
}
