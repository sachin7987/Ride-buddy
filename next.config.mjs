/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external avatars / vehicle photos uploaded to Vercel Blob, plus
  // OpenStreetMap tiles via raster URLs. Tighten this list for production.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Prevent the Prisma client from being bundled by Webpack — it must be
  // resolved at runtime by Node so that the generated `.prisma/client`
  // binary engines load correctly inside the Vercel function.
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
