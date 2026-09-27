import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Keeps the CRA-era `process.env.REACT_APP_*` / `process.env.PUBLIC_URL` references working.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), "REACT_APP_"), ...pickReactEnv(process.env) };
  return {
    base: "./",
    plugins: [react()],
    resolve: { alias: { src: path.resolve(__dirname, "src") } },
    define: {
      "process.env.PUBLIC_URL": JSON.stringify("."),
      ...Object.fromEntries(Object.entries(env).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])),
    },
    build: { outDir: "build" },
    server: { port: Number(loadEnv(mode, process.cwd(), "PORT").PORT || 3000) },
  };
});

function pickReactEnv(e) {
  return Object.fromEntries(Object.entries(e).filter(([k]) => k.startsWith("REACT_APP_")));
}
