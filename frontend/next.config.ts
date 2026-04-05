import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api-backend',
        destination: 'https://smart-xerox-web.onrender.com/api',
      },
      {
        source: '/api-backend/:path*',
        destination: 'https://smart-xerox-web.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
