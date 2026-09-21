import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";
import {
  SHARED_PACKAGE_PATHS,
  SOCKET_BARREL_PATTERNS,
} from "../../eslint-barrel-rules.mjs";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // paths  → exact package/name matches   ({ name, message })
      // patterns → glob group matches          ({ group, message })
      "no-restricted-imports": [
        "warn",
        {
          paths: SHARED_PACKAGE_PATHS,
          patterns: SOCKET_BARREL_PATTERNS,
        },
      ],
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
  eslintConfigPrettier,
  globalIgnores(["dist/**", "node_modules/**"]),
]);

export default eslintConfig;
