// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///D:/security-tools/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/security-tools/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var __vite_injected_original_dirname = "D:\\security-tools\\frontend";
var vite_config_default = defineConfig(({ mode }) => {
  const rootDir = path.resolve(__vite_injected_original_dirname, "..");
  const env = loadEnv(mode, rootDir, "");
  const BACKEND_PORT = env.BACKEND_PORT || "8000";
  const FRONTEND_PORT = Number(env.FRONTEND_PORT) || 5173;
  const DOCS_PORT = env.DOCS_PORT || "5174";
  const backendTarget = `http://127.0.0.1:${BACKEND_PORT}`;
  const docsUrl = `http://localhost:${DOCS_PORT}/docs/`;
  const proxyPaths = ["/config", "/tests", "/run", "/status", "/stop", "/projects", "/global"];
  const proxy = Object.fromEntries(
    proxyPaths.map((p) => [p, { target: backendTarget, changeOrigin: true }])
  );
  proxy["/ws"] = { target: `ws://127.0.0.1:${BACKEND_PORT}`, ws: true, changeOrigin: true };
  return {
    plugins: [react()],
    // Expose VITE_* vars from the root .env (not frontend/.env) to the client.
    envDir: rootDir,
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    // Docs link URL derived from DOCS_PORT — single knob, no drift.
    define: {
      "import.meta.env.VITE_DOCS_URL": JSON.stringify(docsUrl)
    },
    // Tauri expects a fixed port in dev
    server: {
      port: FRONTEND_PORT,
      strictPort: true,
      host: "0.0.0.0",
      proxy
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzZWN1cml0eS10b29sc1xcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcc2VjdXJpdHktdG9vbHNcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3NlY3VyaXR5LXRvb2xzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIFJlYWQgdGhlIHNpbmdsZSBzb3VyY2Utb2YtdHJ1dGggLmVudiBhdCB0aGUgcmVwbyByb290IChvbmUgbGV2ZWwgdXApLlxuICBjb25zdCByb290RGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJylcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCByb290RGlyLCAnJylcblxuICBjb25zdCBCQUNLRU5EX1BPUlQgPSBlbnYuQkFDS0VORF9QT1JUIHx8ICc4MDAwJ1xuICBjb25zdCBGUk9OVEVORF9QT1JUID0gTnVtYmVyKGVudi5GUk9OVEVORF9QT1JUKSB8fCA1MTczXG4gIGNvbnN0IERPQ1NfUE9SVCA9IGVudi5ET0NTX1BPUlQgfHwgJzUxNzQnXG5cbiAgY29uc3QgYmFja2VuZFRhcmdldCA9IGBodHRwOi8vMTI3LjAuMC4xOiR7QkFDS0VORF9QT1JUfWBcbiAgY29uc3QgZG9jc1VybCA9IGBodHRwOi8vbG9jYWxob3N0OiR7RE9DU19QT1JUfS9kb2NzL2BcblxuICAvLyBBbGwgYmFja2VuZCByb3V0ZXMgc2hhcmUgdGhlIHNhbWUgcHJveHkgdGFyZ2V0LlxuICBjb25zdCBwcm94eVBhdGhzID0gWycvY29uZmlnJywgJy90ZXN0cycsICcvcnVuJywgJy9zdGF0dXMnLCAnL3N0b3AnLCAnL3Byb2plY3RzJywgJy9nbG9iYWwnXVxuICBjb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgYW55PiA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBwcm94eVBhdGhzLm1hcCgocCkgPT4gW3AsIHsgdGFyZ2V0OiBiYWNrZW5kVGFyZ2V0LCBjaGFuZ2VPcmlnaW46IHRydWUgfV0pLFxuICApXG4gIHByb3h5Wycvd3MnXSA9IHsgdGFyZ2V0OiBgd3M6Ly8xMjcuMC4wLjE6JHtCQUNLRU5EX1BPUlR9YCwgd3M6IHRydWUsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgLy8gRXhwb3NlIFZJVEVfKiB2YXJzIGZyb20gdGhlIHJvb3QgLmVudiAobm90IGZyb250ZW5kLy5lbnYpIHRvIHRoZSBjbGllbnQuXG4gICAgZW52RGlyOiByb290RGlyLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gRG9jcyBsaW5rIFVSTCBkZXJpdmVkIGZyb20gRE9DU19QT1JUIFx1MjAxNCBzaW5nbGUga25vYiwgbm8gZHJpZnQuXG4gICAgZGVmaW5lOiB7XG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfRE9DU19VUkwnOiBKU09OLnN0cmluZ2lmeShkb2NzVXJsKSxcbiAgICB9LFxuICAgIC8vIFRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0IGluIGRldlxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogRlJPTlRFTkRfUE9SVCxcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBwcm94eSxcbiAgICB9LFxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUSxPQUFPLFVBQVU7QUFDdlIsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBRmxCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sVUFBVSxLQUFLLFFBQVEsa0NBQVcsSUFBSTtBQUM1QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFNBQVMsRUFBRTtBQUVyQyxRQUFNLGVBQWUsSUFBSSxnQkFBZ0I7QUFDekMsUUFBTSxnQkFBZ0IsT0FBTyxJQUFJLGFBQWEsS0FBSztBQUNuRCxRQUFNLFlBQVksSUFBSSxhQUFhO0FBRW5DLFFBQU0sZ0JBQWdCLG9CQUFvQixZQUFZO0FBQ3RELFFBQU0sVUFBVSxvQkFBb0IsU0FBUztBQUc3QyxRQUFNLGFBQWEsQ0FBQyxXQUFXLFVBQVUsUUFBUSxXQUFXLFNBQVMsYUFBYSxTQUFTO0FBQzNGLFFBQU0sUUFBNkIsT0FBTztBQUFBLElBQ3hDLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsUUFBUSxlQUFlLGNBQWMsS0FBSyxDQUFDLENBQUM7QUFBQSxFQUMxRTtBQUNBLFFBQU0sS0FBSyxJQUFJLEVBQUUsUUFBUSxrQkFBa0IsWUFBWSxJQUFJLElBQUksTUFBTSxjQUFjLEtBQUs7QUFFeEYsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBO0FBQUEsSUFFakIsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixpQ0FBaUMsS0FBSyxVQUFVLE9BQU87QUFBQSxJQUN6RDtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
