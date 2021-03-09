import assert from "assert";
import { getReadmeRepo, getAllStaredRepos } from "./repo";

main();

async function main() {
	await Promise.all([test1(), test2()]);
	console.log("test passed");
}

async function test1() {
	const data = await getReadmeRepo({
		name: "github-star-search",
		url: "https://github.com/JaosnHsieh/github-star-search",
		description: "default description",
		homepageUrl: "default homepageUrl",
	});
	assert(data.name === "github-star-search");
	assert(data.url === "https://github.com/JaosnHsieh/github-star-search");
	assert(data.description.includes(`default description`));
	assert(
		data.readme.includes(
			`Feature Search your star repositories on Github by text in README, description and repo name offline.`
		)
	);
}

async function test2() {
	//https://github.com/settings/tokens
	const token = "";
	if (!token) {
		throw new Error(
			`test2 needs github token https://github.com/settings/tokens -> tick only "public_repo"`
		);
	}
	const { allRepos: repos } = await getAllStaredRepos({
		token,
		max: 200,
		progressCb: (current, total) => {
			console.log(`progressCb current ${current} total ${total}`);
		},
	});
	assert(repos[0].description.length >= 0);
	assert(repos[0].homepageUrl.length > 0);
	assert(repos[0].name.length > 0);
	assert(repos[0].url.length > 0);
	assert(repos.length === 200);
}
