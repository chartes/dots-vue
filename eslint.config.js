import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  ...pluginVue.configs["flat/recommended"],
  {
    rules: {
      "no-console": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      camelcase: "warn",
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
];
