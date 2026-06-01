import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Permite abrir el dev server vía ngrok (npm run tunnel)
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app", "*.ngrok.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
