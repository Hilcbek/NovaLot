import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";
import { WEB_BARREL_PATTERNS, SHARED_PACKAGE_PATHS } from "../../eslint-barrel-rules.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: WEB_BARREL_PATTERNS, paths: SHARED_PACKAGE_PATHS },
      ],
      // Turn off the base rule and replace it with unused-imports' version —
      // its "no-unused-imports" rule is auto-fixable, so `eslint --fix`
      // actually deletes the dead import line instead of just reporting it.
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Must be last — disables any ESLint rule that would fight Prettier over
  // formatting (indentation, quotes, line length, etc.). Formatting itself
  // is handled by running Prettier directly (bun run format), not through
  // ESLint — keeps the two tools fast and out of each other's way.
  eslintConfigPrettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;