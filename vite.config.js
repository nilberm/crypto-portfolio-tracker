import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/pages/index.html"),
        portfolio: resolve(__dirname, "src/pages/portfolio.html"),
        coinDetail: resolve(__dirname, "src/pages/coin-detail.html"),
      },
    },
  },
  server: {
    open: "/pages/index.html",
  },
});
