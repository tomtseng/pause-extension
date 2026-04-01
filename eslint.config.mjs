import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: "error",
    },
  },
];
