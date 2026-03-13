import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === "analyze";

  return {
    plugins: [
      react(),
      tailwindcss(),
      isAnalyze &&
        visualizer({
          filename: "dist/bundle-stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        }),
    ].filter(Boolean),
    build: {
      sourcemap: isAnalyze,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (id.includes("react-router")) {
              return "vendor-router";
            }

            if (id.includes("axios")) {
              return "vendor-http";
            }

            if (
              id.includes("framer-motion") ||
              id.includes("lucide-react") ||
              id.includes("sweetalert2")
            ) {
              return "vendor-ui";
            }

            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }

            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "vendor-maps";
            }

            if (id.includes("socket.io-client") || id.includes("engine.io")) {
              return "vendor-realtime";
            }

            return "vendor-core";
          },
        },
      },
    },
  };
});
