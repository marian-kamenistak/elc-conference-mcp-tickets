// vitest runs test/*.test.ts. src/tests/*.test.ts are node:test files, run from dist by `npm test`.
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["test/**/*.test.ts"] } });
