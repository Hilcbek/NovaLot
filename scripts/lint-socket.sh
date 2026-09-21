#!/bin/sh
# Runs ESLint from apps/socket so it picks up apps/socket/eslint.config.mjs.
# All arguments are absolute file paths passed by lint-staged.
set -e
cd "$(dirname "$0")/../apps/socket"
exec ./node_modules/.bin/eslint --fix --max-warnings=0 "$@"
