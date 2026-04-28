/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'habilitadev-backendd.onrender.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer }) => {
    // Ignorar sqlite3 durante o build (não disponível em ambientes serverless)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'sqlite3': 'commonjs sqlite3',
      });
    }
    return config;
  },
  // ✅ SOLUÇÃO CORRETA: Rewrite /api/v1/* para /api/proxy/*
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/proxy/:path*',
      },
    ];
  },
  // Configurações para melhorar estabilidade
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // Configurações de desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),
}

export default nextConfig
