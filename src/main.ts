import { saveConfig, saveReadmeRepos } from "./api/repo";
import { configValidator, readmeReposValidator } from "./validators";

main();

async function main() {
	await initData();
	const { cli } = await import("./cli");
	cli();
}

async function initData() {
	try {
		const config = await import("./data/config.json");

		const isConfigValid = configValidator(config);
		if (!isConfigValid) {
			await saveConfig({
				lastFetchedAt: "",
				lastFetchedCursor: "",
				token: "",
			});
		}

		const readmeRepos = (await import("./data/readmeRepos.json")).default;

		const isReadmeReposValid = readmeReposValidator(readmeRepos);
		if (!isReadmeReposValid) {
			console.error(
				`$ isReadmeReposValid err`,
				readmeReposValidator.errors,
				"readmeRepos",
				readmeRepos
			);
			await saveReadmeRepos([]);
		}
	} catch (err) {
		console.error(err);
	}
}
