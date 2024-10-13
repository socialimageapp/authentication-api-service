import eslint from "@eslint/js";
import { config, configs } from "typescript-eslint";

export default config(
	eslint.configs.recommended,
	...configs.recommended,
	{ files: ["src/**/*.ts"] },
	{ ignores: ["**/*.js", "lib/*"] },
);
