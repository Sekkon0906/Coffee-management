// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy general para TODO lo que empiece por /api
      "/api": {
        target: "http://localhost:4000", // backend
        changeOrigin: true,
      },
      // Si prefieres ser explícito, puedes agregar esta línea
      // "/api/traceability": {
      //   target: "http://localhost:4000",
      //   changeOrigin: true,
      // },
    },
  },
});
