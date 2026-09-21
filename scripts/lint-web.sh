#!/bin/sh
# Runs ESLint from apps/web so it picks up apps/web/eslint.config.mjs.
# All arguments are absolute file paths passed by lint-staged.
set -e
cd "$(dirname "$0")/../apps/web"
exec ./node_modules/.bin/eslint --fix --max-warnings=0 "$@"
