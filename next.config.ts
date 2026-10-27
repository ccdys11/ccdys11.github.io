import type { NextConfig } from 'next';

const isGitHubPagesBuild = process.env.SITE_TARGET === 'github-pages';

const nextConfig: NextConfig = isGitHubPagesBuild
  ? {
      output: 'export',
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
