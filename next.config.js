/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14, no experimental flag needed
  experimental: {
    // Prevent tracing into native/icon build tooling to avoid micromatch recursion on Vercel
    outputFileTracingExcludes: {
      '*': [
        '**/node_modules/sharp/**',
        '**/node_modules/png-to-ico/**',
        '**/scripts/**'
      ]
    }
  }
}

module.exports = nextConfig
