import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  serverExternalPackages: [],
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

if (process.env.NODE_ENV === "development") {
  try {
    const keyPath = join(process.cwd(), "certs", "localhost-key.pem");
    const certPath = join(process.cwd(), "certs", "localhost.pem");
    readFileSync(keyPath);
    readFileSync(certPath);
    console.log("HTTPS certificates found, HTTPS mode available");
  } catch {
    console.warn("HTTPS certificates not found, using HTTP mode only");
  }
}

export default nextConfig;
