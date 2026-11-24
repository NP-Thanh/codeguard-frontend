import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BACKEND = "http://codeguard-alb-1200091977.ap-southeast-2.elb.amazonaws.com";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": {
        target: BACKEND,
        changeOrigin: true,
      },
      "/api": {
        target: BACKEND,
        changeOrigin: true,
      },
    },
  },
});
