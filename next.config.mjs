/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    WLD_CLIENT_ID: process.env.WLD_CLIENT_ID,
    WLD_CLIENT_SECRET: process.env.WLD_CLIENT_SECRET,
  },
};

export default nextConfig;
