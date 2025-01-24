import eslint from "@eslint/js";
import { config, configs } from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default config(
	eslintConfigPrettier,
	eslint.configs.recommended,
	...configs.recommended,
	{ rules: { "no-console": "error" } },
	{ files: ["src/**/*.ts"] },
	{ ignores: ["**/*.js", "*.cjs", "lib/*", "dist/*", "production/*"] },
);
