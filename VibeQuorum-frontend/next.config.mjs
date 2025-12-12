/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
    
    // Ignore optional dependencies that aren't needed for web
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
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
