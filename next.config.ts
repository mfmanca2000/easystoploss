import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // yahoo-finance2 imports a test-only package in one of its ESM files.
    // Stub it out so webpack skips it — it is never called at runtime.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@gadicc/fetch-mock-cache': false,
    };
    return config;
  },
};

export default nextConfig;
