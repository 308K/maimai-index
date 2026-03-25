import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/")
          if (!normalizedId.includes("/node_modules/")) {
            return
          }

          const packagePath = normalizedId.split("/node_modules/")[1]
          if (!packagePath) {
            return
          }

          const segments = packagePath.split("/").filter(Boolean)
          const packageName =
            segments[0]?.startsWith("@") && segments[1]
              ? `${segments[0]}/${segments[1]}`
              : segments[0]

          if (!packageName) {
            return
          }

          // Keep groups coarse for better cache hit ratio and fewer requests.
          if (["react", "react-dom", "scheduler"].includes(packageName)) {
            return "vendor-react"
          }

          if (packageName.startsWith("@radix-ui/") || packageName.startsWith("@floating-ui/")) {
            return "vendor-radix"
          }

          if (["echarts", "zrender", "recharts"].includes(packageName)) {
            return "vendor-chart"
          }

          if (["react-hook-form", "@hookform/resolvers", "zod"].includes(packageName)) {
            return "vendor-form"
          }

          if (["cmdk", "embla-carousel-react", "sonner", "vaul", "react-day-picker", "react-resizable-panels", "input-otp", "lucide-react"].includes(packageName)) {
            return "vendor-ui"
          }

          if (["clsx", "class-variance-authority", "tailwind-merge", "date-fns", "next-themes"].includes(packageName)) {
            return "vendor-utils"
          }

          return "vendor-misc"
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
