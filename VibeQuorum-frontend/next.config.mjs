/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js native modules for WalletConnect
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    
    // Ignore problematic test files from thread-stream
    config.module.rules.push({
      test: /node_modules[\\/]thread-stream[\\/](?:test|LICENSE|README)/,
      loader: 'ignore-loader',
    })
    
    return config
  },
}

export default nextConfig
