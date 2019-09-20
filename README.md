## Motivation

I need to search repos I added star before but github didn't provide this filter.

## Usage

1. Apply for github personal access token from `https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line`. 
2. Rename `.env.example` file to `.env`  
3. Replace GITGUB_PERSONAL_ACCESS_TOKEN in `.env` file by your valid token .

### collect repo data and save

`$npm start`

### search repo data by text

`$npm run search 'YOURKEYWORD'`

examples: 

`$npm run search 'express'`

`$npm run search 'The original author of Express'`

if you have stared [express](https://github.com/expressjs/express), it would find some results.




## Github personal access token permission 

`public_repo` permission required only

![github-token](screenshots/github-personal-access-token-auth.png)


## TODOS

- [ ] global CLI for easier usage: `$npm i -g starsearch`,`$starsearch`,`$starsearch express`
