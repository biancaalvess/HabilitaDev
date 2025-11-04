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
        hostname: 'habilitadev-backend.onrender.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
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
