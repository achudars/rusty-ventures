/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable WASM modules to be loaded
  webpack(config, { isServer }) {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    // When running in the browser
    if (!isServer) {
      // Add wasm MIME type
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });
    }

    // Fix "Module not found" error for node-fetch
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  // Configuration for external packages
  serverExternalPackages: ['wasm'],
};

module.exports = nextConfig;
