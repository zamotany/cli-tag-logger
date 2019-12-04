#!/bin/bash
token=""

# Ask for GitHub token if not set
if [[ -z $GITHUB_TOKEN ]]; then
  read -sp 'GitHub token: ' token
  if [[ -z $token ]]; then
    echo '\nGitHub token cannot be empty'
    exit 1
  fi
else
  token="$GITHUB_TOKEN"
fi

GITHUB_TOKEN="$token" node ./node_modules/.bin/release-it
