/* eslint-disable no-console */
import { execSync } from "child_process";
import path from "path";
import yargs from "yargs";

// Function to run shell commands
const runCommand = (command: string, cwd: string) => {
	try {
		console.log(`Running: ${command} in ${cwd}`);
		execSync(command, { stdio: "inherit", cwd });
	} catch {
		console.error(`Error executing command: ${command}`);
		process.exit(1);
	}
};

// Parse command-line arguments
const argv = yargs(process.argv.slice(2))
	.option("repos", {
		alias: "r",
		describe: "Comma-separated list of repository paths",
		type: "string",
		demandOption: true,
	})
	.option("commit", {
		alias: "c",
		describe: "Commit hash to checkout (overridden if --submoduleFolder is provided)",
		type: "string",
		// Not required if submoduleFolder is provided.
		demandOption: false,
	})
	.option("submoduleFolder", {
		alias: "f",
		describe: "Folder path to submodule repository to fetch the latest commit",
		type: "string",
	})
	.help()
	.parseSync();

// Ensure at least one of --commit or --submoduleFolder is provided.
if (!argv.commit && !argv.submoduleFolder) {
	console.error("Either --commit or --submoduleFolder must be provided.");
	process.exit(1);
}

let commitHash = argv.commit || "";

// If submoduleFolder is provided, get the latest commit hash from that folder.
if (argv.submoduleFolder) {
	const submoduleFolderPath = path.resolve(argv.submoduleFolder);
	try {
		commitHash = execSync("git rev-parse HEAD", {
			cwd: submoduleFolderPath,
			encoding: "utf-8",
		}).trim();
		console.log(
			`Using commit ${commitHash} from submodule folder ${submoduleFolderPath}`,
		);
	} catch {
		console.error("Failed to get latest commit id from provided submodule folder.");
		process.exit(1);
	}
}

const updateSubmoduleAndInstall = async () => {
	const repos = argv.repos.split(",").map((repo) => path.resolve(repo));
	const submodulePath = "lib/ast";

	const updateRepo = (repoPath: string) => {
		console.log(`Updating submodule in repository: ${repoPath}`);
		runCommand(`git submodule update --init --recursive`, repoPath);
		runCommand(`git fetch origin`, path.join(repoPath, submodulePath));
		runCommand(`git checkout ${commitHash}`, path.join(repoPath, submodulePath));
		runCommand("pnpm upgrade", repoPath);
	};

	repos.forEach(updateRepo);
	console.log("Submodule update and installation completed.");
};

// Run the script
updateSubmoduleAndInstall();
