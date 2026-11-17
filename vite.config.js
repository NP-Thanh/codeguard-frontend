import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": {
        target: "http://codeguard-alb-1448824556.ap-southeast-2.elb.amazonaws.com",
        changeOrigin: true,
      },
    },
  },
});