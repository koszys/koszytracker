import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const r2Hostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
};

if (r2Hostname) {
  nextConfig.images!.remotePatterns!.push({
    protocol: 'https',
    hostname: r2Hostname,
    pathname: '/**',
  });
}
export default withPayload(nextConfig);
