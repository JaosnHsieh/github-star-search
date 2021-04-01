# github-star-search

Search your github starred repositories offline through `README` , `description` and other fields.

![Screen capture animation](./github-star-search.gif)

## Usage

[Generate new token](https://github.com/settings/tokens) with `public_repo` -> `Access public repositories` permission.

```sh
npm i -g @jasonhsieh/star-search
star-search
```

## Features

-   Search through `readme` and `url`, `homepageUrl`, `name`, `description` text offline.

-   Fuzzy search by [fuse.js](https://fusejs.io/). Exact match by adding double quote `"` such as `"express.js"`, or multiple `minimalist "express" "web framework for node"`.

-   Check new starred repos and update at most once daily while running

-   Select and open in browser. `Arrow Up`, `Arrow Down`, `Page Down`, `Page Up` and `Enter` to open in browser.

## Why?

Github [filter](https://github.com/tj?tab=stars) not support search through `README` content yet.

## License

MIT

## Credits

[wiki-cil](https://github.com/hexrcs/wiki-cli) - interactive UI style

[ink](https://github.com/vadimdemedes/ink) - awesome React cli renderer

and more....

```
	"@types/lodash.debounce": "^4.0.6",
	"@types/x-ray": "^2.3.3",
	"ajv": "^7.2.1",
	"ajv-errors": "^2.0.0",
	"cross-fetch": "^3.0.6",
	"fuse.js": "^6.4.6",
	"ink": "^3.0.8",
	"ink-text-input": "^4.0.1",
	"lodash.chunk": "^4.2.0",
	"lodash.debounce": "^4.0.8",
	"lodash.escaperegexp": "^4.1.2",
	"lodash.throttle": "^4.1.1",
	"mobx": "^6.1.8",
	"mobx-react-lite": "^3.2.0",
	"open": "^8.0.2",
	"react": "^17.0.1",
	"react-dom": "^17.0.1",
	"x-ray": "^2.3.4"
	"@types/lodash.chunk": "^4.2.6",
	"@types/lodash.escaperegexp": "^4.1.6",
	"@types/lodash.throttle": "^4.1.6",
	"@types/react": "^17.0.2",
	"chalk": "^4.1.0",
	"eslint-config-xo-react": "^0.24.0",
	"eslint-plugin-react": "^7.22.0",
	"eslint-plugin-react-hooks": "^4.2.0",
	"ink-testing-library": "^2.1.0",
	"prettier": "^2.2.1",
	"prettier-quick": "^0.0.5",
	"ts-node": "^9.1.1",
	"typescript": "^4.2.2",
	"typescript-json-schema": "^0.49.0"

```
