import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Sirf local dev ke liye: npm run dev pe api/recommend.js chalata hai
function devApi() {
  return {
    name: "dev-api",
    configureServer(server) {
      Object.assign(process.env, loadEnv("development", process.cwd(), ""));

      server.middlewares.use("/api/recommend", async (req, res) => {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        req.body = raw ? JSON.parse(raw) : {};

        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        const mod = await server.ssrLoadModule("/api/recommend.js");
        await mod.default(req, res);
      });
    },
  };
}

export default defineConfig({ plugins: [react(), devApi()] });