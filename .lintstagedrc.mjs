// .lintstagedrc.mjs
// Function-based config so we can run eslint from each app's own directory.
// lint-staged spawns commands without a shell, so we use helper scripts for
// commands that need a working-directory change (cd is a shell built-in).

import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const prettier = path.join(root, "node_modules/.bin/prettier");

export default {
  "apps/socket/**/*.{ts,tsx}": (files) => [
    // Run eslint via the lint helper script that sets the correct cwd
    `sh ${root}/scripts/lint-socket.sh ${files.join(" ")}`,
    `${prettier} --write ${files.join(" ")}`,
  ],
  "apps/web/**/*.{ts,tsx}": (files) => [
    `sh ${root}/scripts/lint-web.sh ${files.join(" ")}`,
    `${prettier} --write ${files.join(" ")}`,
  ],
  "**/*.{js,mjs,cjs}": (files) => [`${prettier} --write ${files.join(" ")}`],
  "**/*.{json,md,mdx,css,yaml,yml}": (files) => [
    `${prettier} --write ${files.join(" ")}`,
  ],
};
