import eslint from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			semi: ["error", "always"],
			"prettier/prettier": ["error", { semi: true }],
		},
	},
	{
		ignores: ["src/client/vite-env.d.ts", "src/index.d.ts"],
		languageOptions: {
			parserOptions: {
				project: path.resolve(__dirname, "./tsconfig.json"),
			},
		},
	},
	{ ignores: ["**/*js", "*.cjs", "lib/*", "dist/*", "production/*"] },
);
