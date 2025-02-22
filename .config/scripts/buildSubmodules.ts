import { execSync } from "child_process";
import { readdirSync, readFileSync, existsSync } from "fs";
import { rm, cp } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Derive __dirname using import.meta.url
const __dirname = dirname(fileURLToPath(import.meta.url));

const libPath = resolve(__dirname, "../../lib");
const nodeModulesPath = resolve(__dirname, "../../node_modules");

console.log(`libPath: ${libPath}`);
console.log(`nodeModulesPath: ${nodeModulesPath}`);

// Get all directories inside the lib/ folder
const directories = readdirSync(libPath, { withFileTypes: true })
	.filter((dir) => dir.isDirectory())
	.map((dir) => dir.name);

console.log(`Found directories: ${directories.join(", ")}`);

await Promise.allSettled(
	directories.map(async (dirName) => {
		const dirPath = join(libPath, dirName);
		console.log(`Processing directory: ${dirPath}`);

		// Install dependencies and build the project
		try {
			console.log(`Installing and building ${dirName}...`);
			execSync("pnpm install", { cwd: dirPath, stdio: "inherit" });
			execSync("pnpm build", { cwd: dirPath, stdio: "inherit" });
		} catch (error) {
			console.error(`Failed to install/build ${dirName}:`, error);
			return;
		}

		// Read package.json to get the package name
		const packageJsonPath = join(dirPath, "package.json");
		if (!existsSync(packageJsonPath)) {
			console.error(`No package.json found in ${dirPath}`);
			return;
		}

		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		const packageName = packageJson.name;

		if (!packageName) {
			console.error(`No name field in package.json for ${dirName}`);
			return;
		}

		console.log(`Package name: ${packageName}`);

		// Move the build output to the correct node_modules location
		const distPath = join(dirPath, "dist");
		const targetPath = join(nodeModulesPath, packageName);

		if (!existsSync(distPath)) {
			console.error(`No dist folder found for ${dirName}`);
			return;
		}

		try {
			console.log(`Removing existing package at ${targetPath}`);
			await rm(targetPath, { recursive: true, force: true }); // Clear any existing package version in node_modules
			console.log(`Copying dist to ${targetPath}`);
			await cp(distPath, join(targetPath, "dist"), { recursive: true }); // Move dist to the package location in node_modules
			console.log(`Copying package.json to ${targetPath}`);
			await cp(packageJsonPath, join(targetPath, "package.json")); // Move dist to the package location in node_modules
			console.log(`Moved ${packageName} to node_modules/${packageName}`);
		} catch (error) {
			console.error(`Failed to move ${packageName} to node_modules:`, error);
		}
	}),
);

console.log("Submodules installation and build complete.");
