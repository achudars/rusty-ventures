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
        <title>Rust Ventures — Rust + WebAssembly + Next.js</title>
        <meta name="description" content="A Next.js app with Rust and WebAssembly integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <div className="app-sidebar min-h-screen flex flex-col md:min-h-screen">
          {/* Logo / branding */}
          <div className="px-4 pt-5 pb-4 sidebar-brand-border">
            <span className="text-sm font-semibold tracking-tight sidebar-brand-text">
              rusty-ventures
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pt-4">
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-widest mb-2 px-2 sidebar-section-label">
                Files
              </p>

              {isLoadingFiles ? (
                <div className="px-2 py-2 text-sm sidebar-section-label">
                  Loading…
                </div>
              ) : (
                <div className="space-y-0.5">
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
        <div className="flex flex-col flex-1 min-h-screen main-bg">
          {/* Header */}
          <header className="app-header px-6 py-3">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-sm tracking-tight header-title">
                Rust Ventures
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full wasm-badge">
                WebAssembly
              </span>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden p-4 md:p-6 gap-4 md:gap-5 flex-col lg:flex-row">
            {/* Left side — description panel */}
            <div className="w-full lg:w-1/2 rounded-xl overflow-y-auto min-h-[40vh] lg:min-h-auto content-panel">
              <div className="p-5 md:p-6">
                <h2 className="text-lg font-semibold mb-1 tracking-tight content-heading">
                  Rust Playground
                </h2>
                <p className="text-sm mb-5 leading-relaxed content-body">
                  Execute Rust code directly in the browser using WebAssembly. Browse source files, toggle between implementation and tests, then run the code to see output.
                </p>

                <div className="rounded-lg p-4 mb-3 info-card">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-2 info-card-title">How it works</h3>
                  <p className="text-sm leading-relaxed info-card-text">
                    Rust source is compiled to WebAssembly at build time and loaded at runtime. The interpreter parses <code className="text-xs px-1 py-0.5 rounded inline-code">fn main()</code>, evaluates statements, and captures <code className="text-xs px-1 py-0.5 rounded inline-code">println!</code> output in real time.
                  </p>
                </div>

                <div className="rounded-lg p-4 mb-3 info-card">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-2 info-card-title">Code display</h3>
                  <p className="text-sm leading-relaxed info-card-text">
                    Select any Rust file from the sidebar. Switch between the <strong className="info-card-strong">Source</strong> and <strong className="info-card-strong">Test</strong> tabs in the editor to browse implementation and test files side by side.
                  </p>
                </div>

                <div className="rounded-lg p-4 info-card">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-3 info-card-title">Features</h3>
                  <ul className="text-sm leading-relaxed space-y-1.5 info-card-text">
                    {[
                      'Execute Rust code in the browser via WebAssembly',
                      'Syntax highlighting powered by CodeMirror',
                      'Dynamic file discovery from the project',
                      'Source and test file toggling',
                      'Real-time output console',
                      'Responsive, accessible layout',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="feature-bullet">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side — code editor */}
            <div className="w-full lg:w-1/2 right-panel rounded-xl overflow-hidden flex flex-col min-h-[50vh] lg:min-h-auto right-panel-border">
              <RustCodeEditor currentFile={activeTab} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
