import { defineConfig } from "vitest/config";

// Database tests: real Postgres, run one file at a time.
export default defineConfig({
  test: {
    include: ["**/*.db.test.ts"],
    exclude: ["node_modules/**"],
    globalSetup: ["./test/dbSetup.ts"],
    setupFiles: ["./test/dbEnv.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
});
