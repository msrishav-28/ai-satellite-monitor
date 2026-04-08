import type { NextConfig } from "next";
import path from "node:path";

const isDev = process.env.NODE_ENV === 'development';

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: 'slelguoygbfzlpylpxfs.supabase.co',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(isDev ? {
    turbopack: {
      rules: {
        "*.{jsx,tsx}": {
          loaders: [LOADER]
        }
      }
    }
  } : {}),
};

export default nextConfig;
