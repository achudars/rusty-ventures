import { useState, useEffect } from 'react';
import styles from './RustPlayground.module.css';

interface RustPlaygroundProps {
    defaultCode?: string;
}

interface RustModule {
    run_hello_world: () => string;
    get_sample_code: () => string;
}

// Default code if everything fails
const defaultRustCode = `fn main() {
    println!("Hello, World from Rust!");
}`;

// Create a simple fallback module if loading fails
const fallbackModule: RustModule = {
    run_hello_world: () => "Hello, World from JavaScript fallback!",
    get_sample_code: () => defaultRustCode
};

const RustPlayground: React.FC<RustPlaygroundProps> = ({ defaultCode = '' }) => {
    const [code, setCode] = useState<string>(defaultCode || defaultRustCode);
    const [output, setOutput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [rustModule, setRustModule] = useState<RustModule | null>(null);
    const [wasmLoadStatus, setWasmLoadStatus] = useState<string>('loading');

    // Helper function to load a script
    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    };
    
    // Load the WebAssembly module
    useEffect(() => {
        // This prevents any attempt to use WebAssembly during SSR
        if (typeof window === 'undefined') return;
        
        const loadWasm = async () => {
            try {
                setWasmLoadStatus('loading');
                
                // Load both scripts
                try {
                    // First load the Wasm JS wrapper
                    await loadScript('/wasm/rust.js');
                    
                    // Then load our helper script
                    await loadScript('/wasm/wasm-loader.js');
                    
                    // Initialize the WebAssembly module
                    if (typeof window.initRustWasm === 'function') {
                        const result = await window.initRustWasm();
                        // Type check the result before using it
                        const wasmApi = result as RustModule;
                        
                        if (typeof wasmApi.run_hello_world === 'function' && 
                            typeof wasmApi.get_sample_code === 'function') {
                            setRustModule(wasmApi);
                            setCode(wasmApi.get_sample_code());
                            setWasmLoadStatus('loaded');
                            console.log('Successfully loaded Rust module');
                        } else {
                            throw new Error('Invalid WebAssembly module structure');
                        }
                    } else {
                        throw new Error('initRustWasm function not found');
                    }
                } catch (scriptError) {
                    console.error('Script loading error:', scriptError);
                    throw scriptError; // Re-throw to be caught by the outer catch
                }
            } catch (error) {
                console.error('Failed to load WebAssembly module:', error);
                setRustModule(fallbackModule);
                setWasmLoadStatus('fallback');
                setCode(fallbackModule.get_sample_code());
            }
        };

        loadWasm();
    }, []);

    // Function to run the Rust code
    const runCode = async () => {
        if (!rustModule) {
            setOutput('WebAssembly module not loaded yet. Please wait...');
            return;
        }

        setLoading(true);
        setOutput('Running code...');

        try {
            // In a real implementation, we would compile and run the user's code
            // Here, we're just calling the pre-compiled function
            const result = rustModule.run_hello_world();
            setOutput(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setOutput(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.playground}>
            <h2 className={styles.title}>
                Rust Playground
                {wasmLoadStatus === 'loading' && <span> (Loading...)</span>}
                {wasmLoadStatus === 'fallback' && <span> (Using Fallback)</span>}
                {wasmLoadStatus === 'error' && <span> (Error Loading WebAssembly)</span>}
            </h2>
            <div className={styles.editor}>
                <pre className={styles.codeArea}>
                    <code>
                        {code}
                    </code>
                </pre>
                <button
                    onClick={runCode}
                    disabled={loading || !rustModule}
                    className={styles.runButton}
                >
                    {loading ? 'Running...' : '▶ Run'}
                </button>
            </div>
            {output && (
                <div className={styles.output}>
                    <h3>Output</h3>
                    <pre>{output}</pre>
                </div>
            )}
        </div>
    );
};

export default RustPlayground;
