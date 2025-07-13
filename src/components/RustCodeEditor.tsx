"use client";

import { useEffect, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { rust } from "@codemirror/lang-rust";
import { PlayIcon } from "./Icons";

interface CodeEditorProps {
    currentFile?: string;
}

const CodeEditor = ({ currentFile = "hello.rs" }: CodeEditorProps) => {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [viewMode, setViewMode] = useState<'source' | 'test'>('source');
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [rustModule, setRustModule] = useState<{
        run_hello_world: () => string;
        get_sample_code: () => string;
    } | null>(null);

    // Function to get the appropriate filename based on view mode
    const getFileName = useCallback((baseFile: string, mode: 'source' | 'test') => {
        if (mode === 'test') {
            const baseName = baseFile.replace('.rs', '');
            return `test_${baseName}.rs`;
        }
        return baseFile;
    }, []);

    // Function to load file content
    const loadFileContent = useCallback(async (filename: string, mode: 'source' | 'test') => {
        setIsLoadingFile(true);
        const actualFileName = getFileName(filename, mode);
        const apiPath = mode === 'test' ? `tests/${actualFileName}` : actualFileName;

        try {
            const response = await fetch(`/api/rust/${apiPath}`);

            if (response.ok) {
                const content = await response.text();
                setCode(content);
            } else {
                console.error(`Failed to load ${actualFileName}:`, response.status);
                setCode(`// Error: Could not load ${actualFileName} (${response.status})`);
            }
        } catch (error) {
            console.error(`Error loading ${actualFileName}:`, error);
            setCode(`// Error: Could not load ${actualFileName}`);
        } finally {
            setIsLoadingFile(false);
        }
    }, [getFileName]);

    // Reset to source view when currentFile changes
    useEffect(() => {
        setViewMode('source');
    }, [currentFile]);

    // Load file content when currentFile or viewMode changes
    useEffect(() => {
        loadFileContent(currentFile, viewMode);
        setOutput(""); // Clear output when switching files
    }, [currentFile, viewMode, loadFileContent]);

    // Helper function to load a script as a module
    const loadScriptAsModule = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
        import * as wasmModule from '${src}';
        window.wasmModule = wasmModule;
        window.dispatchEvent(new CustomEvent('wasmModuleLoaded'));
      `;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);

            window.addEventListener('wasmModuleLoaded', () => {
                resolve();
            }, { once: true });
        });
    };

    // Load the WebAssembly module
    useEffect(() => {
        // This prevents any attempt to use WebAssembly during SSR
        if (typeof window === 'undefined') return;

        const loadWasm = async () => {
            try {
                setIsLoading(true);
                setOutput("Loading Rust WebAssembly environment...");

                // Load the WASM module as an ES6 module
                await loadScriptAsModule('/wasm/rust.js');

                // Access the loaded module from window
                const wasmModule = window.wasmModule;

                if (wasmModule?.default) {
                    // Initialize the WebAssembly module
                    await wasmModule.default('/wasm/rust_bg.wasm');

                    // Validate that the module has the required functions
                    if (typeof wasmModule.run_hello_world === 'function' &&
                        typeof wasmModule.get_sample_code === 'function') {

                        const rustApi = {
                            run_hello_world: wasmModule.run_hello_world,
                            get_sample_code: wasmModule.get_sample_code
                        };

                        setRustModule(rustApi);
                        setOutput("Rust WebAssembly environment ready! Click 'Run Code' to execute Rust code.");
                        console.log('Successfully loaded Rust module');
                    } else {
                        throw new Error('Invalid WebAssembly module structure');
                    }
                } else {
                    throw new Error('Failed to load WebAssembly module');
                }
            } catch (error) {
                console.error('Failed to load WebAssembly module:', error);
                setOutput("WebAssembly environment failed to load. The code editor is still available for viewing Rust code.");
                setLoadingError(error instanceof Error ? error.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        loadWasm();
    }, []);

    // Function to retry loading WebAssembly
    const retryLoadWasm = useCallback(() => {
        setLoadingError(null);
        setRustModule(null);
        setIsLoading(true);
        setOutput("Retrying Rust WebAssembly environment initialization...");

        // Remove any existing wasm scripts
        document.querySelectorAll('script[src*="rust.js"]').forEach(s => s.remove());

        // Reload the page to retry
        window.location.reload();
    }, []);

    // Function to run the Rust code
    const runCode = useCallback(async () => {
        if (!rustModule) {
            setOutput('Rust WebAssembly module not loaded yet. Please wait or try reloading...');
            return;
        }

        setIsRunning(true);
        setOutput('Running Rust code...');

        try {
            // In a real implementation, we would compile and run the user's code
            // Here, we're just calling the pre-compiled function
            const result = rustModule.run_hello_world();
            setOutput(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setOutput(`Error: ${errorMessage}`);
        } finally {
            setIsRunning(false);
        }
    }, [rustModule]);

    return (
        <div className="flex flex-col h-full">
            {/* Code editor header */}
            <div className="editor-header border-b">
                {/* Filename row */}
                <div className="px-3 pt-3 pb-2">
                    <span className="text-sm font-medium text-white">
                        {getFileName(currentFile, viewMode)}
                    </span>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-2">
                        {/* Toggle buttons for source/test view */}
                        <button
                            onClick={() => setViewMode('source')}
                            className={`px-4 py-2 rounded-lg text-sm font-normal cursor-pointer transition-colors text-white ${viewMode === 'source'
                                ? 'button-orange-active'
                                : 'hover:button-hover-dark'
                                }`}
                        >
                            Source
                        </button>
                        <button
                            onClick={() => setViewMode('test')}
                            className={`px-4 py-2 rounded-lg text-sm font-normal cursor-pointer transition-colors text-white ${viewMode === 'test'
                                ? 'button-green-active'
                                : 'hover:button-hover-dark'
                                }`}
                        >
                            Test
                        </button>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-white opacity-70 mr-3">
                            {(() => {
                                if (isLoading) return "Loading...";
                                if (isRunning) return "Running...";
                                return "Run";
                            })()}
                        </span>
                        <button
                            onClick={runCode}
                            disabled={isLoading || isRunning || !rustModule}
                            className={`px-4 py-2 rounded-lg run-button cursor-pointer ${isLoading || isRunning || !rustModule
                                ? 'run-button-disabled cursor-not-allowed'
                                : 'run-button-active'
                                }`}
                            aria-label="Run Rust code"
                            title="Run Rust code"
                        >
                            <PlayIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* Code editor */}
            <div className="flex-1 overflow-hidden max-h-[500px]">
                {isLoading || isLoadingFile ? (
                    <div className="loading-container h-full flex flex-col items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block w-8 h-8 border-4 border-steel-blue border-t-transparent rounded-full animate-spin mb-3"></div>
                            <div className="text-sm text-white">
                                {isLoading ? output || "Loading Rust environment..." : "Loading file..."}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="custom-scrollbar overflow-y-auto overflow-x-hidden h-full">
                        <CodeMirror
                            value={code}
                            height="auto"
                            readOnly={true}
                            extensions={[rust()]}
                            theme="dark"
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                highlightSpecialChars: true,
                                foldGutter: true,
                                drawSelection: true,
                                dropCursor: false,
                                indentOnInput: false,
                                syntaxHighlighting: true,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Output console */}
            <div className="output-console custom-scrollbar max-h-[300px] min-h-[100px] border-t p-3 font-mono overflow-y-auto overflow-x-hidden console-bg">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs console-output-text font-medium">Console Output</div>
                    <div className="text-xs text-gray-300">
                        {isRunning && (
                            <span className="inline-block w-2 h-2 bg-light-blue rounded-full mr-1 animate-pulse"></span>
                        )}
                        {(() => {
                            if (isRunning) return "Processing...";
                            if (output) return "Completed";
                            return "Run";
                        })()}
                    </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-white break-words">
                    {(() => {
                        if (isLoading) return "Initializing Rust environment...";
                        if (isRunning) return "Running code...";
                        return output || "Run the code to see the output";
                    })()}
                </pre>
                {loadingError && !isLoading && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                        <button
                            onClick={retryLoadWasm}
                            className="px-4 py-2 bg-steel-blue hover:bg-light-blue text-white text-sm rounded-lg transition-colors"
                        >
                            Retry Loading Rust WebAssembly
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
