import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost = "";
if (supabaseUrl && supabaseUrl.startsWith("http")) {
  try {
    const url = new URL(supabaseUrl);
    supabaseHost = url.hostname;
  } catch (e) {
    console.error("Invalid Supabase URL in next.config.ts:", e);
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      ...(supabaseHost ? [{
        protocol: 'https' as const,
        hostname: supabaseHost,
      }] : []),
    ],
  },
};

export default nextConfig;
