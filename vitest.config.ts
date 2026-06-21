import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve the `@/*` path alias from tsconfig.json (Vite 7+ native support).
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: false,
    include: ["**/*.test.ts"],
  },
});
