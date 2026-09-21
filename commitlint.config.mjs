/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Types allowed in commit messages
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "chore", // maintenance, deps, tooling
        "docs", // documentation only
        "style", // formatting, no logic change
        "refactor", // code change without feature/fix
        "perf", // performance improvement
        "test", // adding or updating tests
        "build", // build system or external deps
        "ci", // CI/CD configuration
        "revert", // revert a previous commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0], // not enforced — detailed commit bodies are welcome
  },
};
