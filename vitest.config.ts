import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Provide a minimal mock for `navigator` used in pathHelpers.ts
    setupFiles: ["src/__tests__/setup.ts"],
  },
});
