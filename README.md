# Rusty Ventures

A Next.js project that demonstrates integration with Rust via WebAssembly. This project allows you to view and execute Rust code in the browser.

## Features

- Split-screen layout with documentation on the left and code on the right
- Rust code execution in the browser using WebAssembly
- Modern UI with responsive design

## Getting Started

First, build the WebAssembly module:

```bash
# Install wasm-pack if you haven't already
npm install -g wasm-pack

# Build the Rust WebAssembly module
npm run build-wasm
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- **Frontend**: Next.js with TypeScript and CSS Modules
- **Rust**: WebAssembly compilation using wasm-pack
- **Integration**: Dynamic imports for WebAssembly modules

## Project Structure

- `/rust`: Contains the Rust code that gets compiled to WebAssembly
- `/src/components`: React components for the UI
- `/public/wasm`: Output directory for compiled WebAssembly modules
