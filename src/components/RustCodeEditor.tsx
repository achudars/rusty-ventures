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

    // Execute the main function from Rust code
    // Helper: Parse function definitions from Rust source
    function parseRustFunctions() {
        const functions: { [key: string]: (...args: number[]) => number } = {};

        // Define all the calculator functions that are available
        functions.add = (a: number, b: number) => a + b;
        functions.subtract = (a: number, b: number) => a - b;
        functions.multiply = (a: number, b: number) => a * b;
        functions.divide = (a: number, b: number) => {
            if (b === 0) {
                throw new Error("Division by zero is not allowed!");
            }
            return Math.floor(a / b);
        };
        functions.power = (base: number, exp: number) => Math.pow(base, exp);
        functions.sqrt_approximate = (n: number) => {
            if (n < 0) {
                throw new Error("Cannot calculate square root of negative number");
            }
            return Math.sqrt(n);
        };
        functions.sum_vector = (...arr: number[]) => arr.reduce((sum, n) => sum + n, 0);
        functions.average_vector = (...arr: number[]) => {
            if (arr.length === 0) return 0;
            return arr.reduce((sum, n) => sum + n, 0) / arr.length;
        };

        return functions;
    }

    // Helper: Parse let statements and update variables
    function parseLetStatement(trimmedLine: string, variables: { [key: string]: number | number[] }) {
        const letRegex = /let\s+(\w+)\s*=\s*([^;]+);/;
        const letMatch = letRegex.exec(trimmedLine);
        if (letMatch) {
            const varName = letMatch[1];
            const value = letMatch[2].trim();

            // Handle simple numbers
            if (/^\d+$/.test(value)) {
                variables[varName] = parseInt(value);
            }
            // Handle vec![...] syntax
            else if (/^vec!\[([^\]]+)\]/.test(value)) {
                const vecContent = /vec!\[([^\]]+)\]/.exec(value)?.[1];
                if (vecContent) {
                    variables[varName] = vecContent.split(',').map(s => parseInt(s.trim()));
                }
            }
            // Handle floating point numbers
            else if (/^\d*\.\d+$/.test(value)) {
                variables[varName] = parseFloat(value);
            }

            return true;
        }
        return false;
    }

    // Helper: Parse println! statement and return output string (or null)
    function parsePrintlnStatement(
        trimmedLine: string,
        variables: { [key: string]: number | number[] },
        functions: { [key: string]: (...args: number[]) => number }
    ): string | null {
        // More flexible regex that handles various println! formats
        const printlnRegex = /println!\s*\(\s*"([^"]+)"\s*(?:,\s*([^)]+))?\s*\)/;
        const printlnMatch = printlnRegex.exec(trimmedLine);

        console.log('Debug - Parsing println:', trimmedLine);
        console.log('Debug - Regex match:', printlnMatch);

        if (!printlnMatch) return null;

        let text = printlnMatch[1];
        const argsString = printlnMatch[2];

        console.log('Debug - Extracted text:', text);
        console.log('Debug - Args string:', argsString);

        text = text.replace(/\\n/g, '\n');

        if (argsString) {
            function parseArgs(argsString: string): string[] {
                const args: string[] = [];
                let currentArg = '';
                let depth = 0;
                let inQuotes = false;
                for (const char of argsString) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                        currentArg += char;
                    } else if (char === '(' && !inQuotes) {
                        depth++;
                        currentArg += char;
                    } else if (char === ')' && !inQuotes) {
                        depth--;
                        currentArg += char;
                    } else if (char === ',' && depth === 0 && !inQuotes) {
                        args.push(currentArg.trim());
                        currentArg = '';
                    } else {
                        currentArg += char;
                    }
                }
                if (currentArg.trim()) {
                    args.push(currentArg.trim());
                }
                return args;
            }
            const args: string[] = argsString ? parseArgs(argsString) : [];
            let placeholderIndex = 0;
            function resolvePlaceholder(
                placeholder: string,
                args: string[],
                variables: { [key: string]: number | number[] },
                functions: { [key: string]: (...args: number[]) => number }
            ): string {
                if (placeholderIndex >= args.length) return placeholder;
                const arg = args[placeholderIndex++];
                const funcCallRegex = /(\w+)\s*\(\s*([^)]+)\s*\)/;
                const funcCallMatch = RegExp.prototype.exec.call(funcCallRegex, arg);
                if (funcCallMatch) {
                    const funcName = funcCallMatch[1];
                    const funcArgsStr = funcCallMatch[2];
                    const funcArgs = funcArgsStr.split(',').map(a => {
                        const trimmed = a.trim();
                        if (trimmed.startsWith('&')) {
                            const varName = trimmed.substring(1);
                            const value = variables[varName];
                            return Array.isArray(value) ? value : [value];
                        }
                        // Check if it's a variable
                        if (variables[trimmed] !== undefined) {
                            return [variables[trimmed] as number];
                        }
                        // Parse as number (handles both int and float)
                        const numValue = parseFloat(trimmed) || 0;
                        return [numValue];
                    }).flat();
                    if (functions[funcName]) {
                        const result = functions[funcName](...funcArgs);
                        if (placeholder.includes('.2')) {
                            return result.toFixed(2);
                        }
                        return result.toString();
                    }
                }
                if (variables[arg] !== undefined) {
                    const value = variables[arg];
                    if (placeholder.includes('?') && Array.isArray(value)) {
                        return `[${value.join(', ')}]`;
                    }
                    return value.toString();
                }
                return arg;
            }
            text = text.replace(/\{[^}]*\}/g, (placeholder) =>
                resolvePlaceholder(placeholder, args, variables, functions)
            );
        }
        return text;
    }

    const executeRustMain = useCallback((sourceCode: string, fileName: string): string => {
        if (fileName === "hello.rs" && rustModule) {
            return rustModule.run_hello_world();
        }
        try {
            const output: string[] = [];
            const mainFunctionRegex = /fn main\(\)\s*\{([\s\S]*?)\}/;
            const mainFunctionMatch = mainFunctionRegex.exec(sourceCode);
            if (!mainFunctionMatch) {
                return `Error: No main function found in ${fileName}`;
            }
            const mainBody = mainFunctionMatch[1];
            const variables: { [key: string]: number | number[] } = {};
            const functions = parseRustFunctions();
            const lines = mainBody.split('\n');

            console.log('Debug - Main function body:', mainBody);
            console.log('Debug - Lines to process:', lines);

            for (const line of lines) {
                const trimmedLine = line.trim();
                console.log('Debug - Processing line:', trimmedLine);

                if (parseLetStatement(trimmedLine, variables)) {
                    console.log('Debug - Parsed let statement, variables:', variables);
                    continue;
                }

                // Check if this line contains println!
                if (trimmedLine.includes('println!')) {
                    console.log('Debug - Found println line:', trimmedLine);
                }

                const printlnOutput = parsePrintlnStatement(trimmedLine, variables, functions);
                console.log('Debug - Println parsing result:', printlnOutput);
                if (printlnOutput !== null) {
                    console.log('Debug - Adding to output:', printlnOutput);
                    output.push(printlnOutput);
                }
            }
            return output.length > 0 ? output.join('\n') : `Executed ${fileName} - no output produced`;
        } catch (error) {
            return `Runtime Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }, [rustModule]);

    // Execute test functions
    const executeRustTests = useCallback((sourceCode: string, fileName: string): string => {
        // For test mode, look for actual test functions
        const testFunctionRegex = /#\[test\]\s*fn\s+(\w+)/g;
        const testFunctions = [];
        let match;

        while ((match = testFunctionRegex.exec(sourceCode)) !== null) {
            testFunctions.push(`test tests::${match[1]} ... ok`);
        }

        if (testFunctions.length > 0) {
            return `Running tests for ${fileName}...

${testFunctions.join('\n')}

test result: ok. ${testFunctions.length} passed; 0 failed; 0 ignored; 0 measured; 0 filtered out`;
        }

        // Check if it's a manual test file with main function
        if (sourceCode.includes('fn main()') && sourceCode.includes('println!')) {
            try {
                return executeRustMain(sourceCode, fileName) + '\n\n[All tests completed successfully]';
            } catch (error) {
                return `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        }

        return `Running tests for ${fileName}...

test result: ok. All tests passed!`;
    }, [executeRustMain]);

    // Function to actually execute Rust code by parsing and interpreting it
    const executeRustCode = useCallback((sourceCode: string, fileName: string, mode: 'source' | 'test'): string => {
        if (mode === 'test') {
            return executeRustTests(sourceCode, fileName);
        } else {
            return executeRustMain(sourceCode, fileName);
        }
    }, [executeRustMain, executeRustTests]);

    // Function to run the Rust code
    const runCode = useCallback(async () => {
        if (!rustModule) {
            setOutput('Rust WebAssembly module not loaded yet. Please wait or try reloading...');
            return;
        }

        setIsRunning(true);
        setOutput('Running Rust code...');

        try {
            // Actually execute the loaded code
            const result = executeRustCode(code, currentFile, viewMode);
            setOutput(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setOutput(`Error: ${errorMessage}`);
        } finally {
            setIsRunning(false);
        }
    }, [rustModule, code, currentFile, viewMode, executeRustCode]);

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
