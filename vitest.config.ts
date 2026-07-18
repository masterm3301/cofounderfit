import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // Test files share a single live Neon test database (no per-file schema
    // isolation) and several files reuse the same literal fixture ids
    // (e.g. "li-1"). Running files in parallel races resetDb()/unique
    // constraints across files, so they must run sequentially.
    fileParallelism: false,
    // Some tests seed 20+ rows via sequential real-DB writes against Neon;
    // that reliably exceeds Vitest's 5000ms default over real network latency.
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
