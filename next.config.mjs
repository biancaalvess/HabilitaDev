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
    domains: ['localhost'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
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
