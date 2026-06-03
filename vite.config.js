import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` only applies to production builds so the site works when served from
// https://<user>.github.io/agent-judgement-map/ — local `npm run dev` stays at /.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/agent-judgement-map/" : "/",
  plugins: [react()],
}));
