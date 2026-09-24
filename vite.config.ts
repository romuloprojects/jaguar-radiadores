import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

const jaguarHost = "jaguar-radiadores.facilities-ai.com.br";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8003,
    allowedHosts: [jaguarHost],
  },
  preview: {
    host: "0.0.0.0",
    port: 8003,
    allowedHosts: [jaguarHost],
  },
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), viteReact(), nitro()],
});
