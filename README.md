## Motivation

I need to search repos' README text I clicked star but github didn't provide this filter.

## Usage

1. Apply for github personal access token from [github](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). 
2. `$npm i -g @jasonhsieh/star-search`
3. `$star-search start --token=YOURACCESSTOKEN`
4. `$star-search search --keyword='express'`  


## Query examples

`$$star-search search --keyword 'YOURKEYWORD'`

full text search powered by sqlite [FTS5](https://www.sqlitetutorial.net/sqlite-full-text-search/)

`$star-search search --keyword 'express'`

`$star-search search --keyword 'express node'`

`$star-search search --keyword 'expre*'`

`$star-search search --keyword 'express AND node'`

`$star-search search --keyword 'express NOT node'`

`$star-search search --keyword 'express OR node'`


### Github personal access token permission 

`public_repo` permission required only

![github-token](screenshots/github-personal-access-token-auth.png)


### TODOS

- [x] global CLI for easier usage: `$npm i -g starsearch`,`$starsearch`,`$starsearch express`
