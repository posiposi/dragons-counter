import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const certsDir = path.resolve(__dirname, "certs");
  const keyPath = path.join(certsDir, "localhost-key.pem");
  const certPath = path.join(certsDir, "localhost.pem");

  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

  return {
    plugins: [react(), ...(hasCerts ? [] : [basicSsl()])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 3043,
      ...(hasCerts && {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
      }),
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
    },
  };
});