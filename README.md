## Feature

Search your star repositories on Github by `text in README`, `description` and `repo name` offline.

## Usage

1. Apply for github personal access token from [github](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line).
2. `$ npm i -g @jasonhsieh/star-search`
3. `$ star-search update --token=YOURACCESSTOKEN`
4. `$ star-search search --keyword='express'`

## Query examples

`$ star-search search --keyword 'express'`

`$ star-search search --keyword 'express node'`

## Github personal access token permission

`public_repo` permission required only

![github-token](screenshots/github-personal-access-token-auth.png)

## Search powered by js-search AllSubstringsIndexStrategy

https://github.com/bvaughn/js-search#configuring-the-index-strategy
