"use client";

import { useState, useEffect, useCallback } from "react";
import Head from 'next/head';
import dynamic from "next/dynamic";
import { FileIcon } from "../components/Icons";

// Dynamically import the RustCodeEditor component to avoid SSR issues with WebAssembly
const RustCodeEditor = dynamic(() => import("@/components/RustCodeEditor"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading Rust environment...</div>,
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("hello.rs");
  const [rustFiles, setRustFiles] = useState<string[]>(["hello.rs", "calculator.rs"]); // fallback files
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Load Rust files from the API
  const loadRustFiles = useCallback(async () => {
    try {
      setIsLoadingFiles(true);
      const response = await fetch('/api/rust/files');
      if (response.ok) {
        const data = await response.json();
        setRustFiles(data.files || ["hello.rs", "calculator.rs"]);

        // Ensure activeTab is valid, default to first file (should be hello.rs)
        if (data.files && data.files.length > 0 && !data.files.includes(activeTab)) {
          setActiveTab(data.files[0]);
        }
      } else {
        console.error('Failed to load Rust files');
        // Keep fallback files
      }
    } catch (error) {
      console.error('Error loading Rust files:', error);
      // Keep fallback files
    } finally {
      setIsLoadingFiles(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadRustFiles();
  }, [loadRustFiles]);

  return (
    <div>
      <Head>
        <title>Rust Ventures - Rust + WebAssembly + Next.js</title>
        <meta name="description" content="A Next.js app with Rust and WebAssembly integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <div className="app-sidebar min-h-screen flex flex-col md:min-h-screen">
          {/* Navigation */}
          <nav className="flex-1 px-4 pt-6">
            <div className="mb-8">
              <h3 className="text-white text-lg font-medium mb-4 px-2">Rust Files</h3>

              {isLoadingFiles ? (
                <div className="px-2 py-3 text-white text-sm">
                  Loading files...
                </div>
              ) : (
                <div className="space-y-1">
                  {rustFiles.map((filename) => (
                    <button
                      key={filename}
                      className={`sidebar-menu-item-rounded w-full text-left ${activeTab === filename ? "active" : ""}`}
                      onClick={() => setActiveTab(filename)}
                    >
                      <FileIcon />
                      {filename}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-h-screen">
          {/* Header */}
          <header className="app-header p-4">
            <div className="flex items-center">
              <div>
                <h1 className="font-bold text-xl">Rust Ventures</h1>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden p-3 md:p-6 gap-3 md:gap-6 flex-col lg:flex-row">
            {/* Left side - Content area */}
            <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 md:p-6 shadow overflow-y-auto min-h-[40vh] lg:min-h-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Rust Playground</h2>
              <p className="mb-4 text-gray-800 leading-relaxed">
                The purpose of this document is to outline the ideas behind Rust code execution in the browser using WebAssembly.
              </p>

              <div className="bg-gray-50 rounded-lg p-5 border mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Main Interface</h3>
                <p className="text-gray-700 leading-relaxed">
                  This is the basic view where you can write and execute Rust code. It uses a color palette inspired by the pride flag design while maintaining the familiar development environment layout.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Running Rust Code</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you click the play button, the Rust code snippet is executed using WebAssembly, a WebAssembly port of the Rust runtime that allows Rust to run directly in the browser.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Code Display</h3>
                <p className="text-gray-700 leading-relaxed">
                  The code snippet is loaded and displayed in the editor on the right. You can browse through different Rust files and switch between source code and test files to see how the code works.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Features</h3>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  <li>• Execute Rust code in the browser using WebAssembly</li>
                  <li>• Code syntax highlighting with CodeMirror</li>
                  <li>• Dynamic file discovery - automatically loads all Rust files from the project</li>
                  <li>• Switch between source code and test files</li>
                  <li>• View execution output in real-time</li>
                  <li>• Responsive design with accessibility features</li>
                  <li>• Comprehensive error handling and user feedback</li>
                </ul>
              </div>
            </div>

            {/* Right side - Code editor */}
            <div className="w-full lg:w-1/2 right-panel rounded-lg shadow overflow-hidden flex flex-col min-h-[50vh] lg:min-h-auto">
              <RustCodeEditor currentFile={activeTab} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
