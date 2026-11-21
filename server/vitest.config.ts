import { configDefaults, defineConfig } from "vitest/config";

// Fast unit tests. Database tests (*.db.test.ts) run with `npm run test:db`.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "**/*.db.test.ts"],
  },
});
