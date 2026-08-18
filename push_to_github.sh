#!/bin/bash
# Run this from the project root in Git Bash (Windows) or any POSIX shell.
# It will create a local repo (if needed), add files, and push to the given remote.

set -e

REMOTE_URL="https://github.com/jes-git/fruit-ninjas.git"
BRANCH="main"

if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
else
  echo "Git repository already initialized."
fi

git add --all
git commit -m "Initial commit - Slice & Spark" || echo "Nothing to commit"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Removing existing origin and replacing with $REMOTE_URL"
  git remote remove origin || true
fi

git remote add origin "$REMOTE_URL"
git branch -M "$BRANCH"

echo "Pushing to $REMOTE_URL (you may be prompted for credentials)..."
git push -u origin "$BRANCH"

echo "Done. If push failed due to authentication, consider using an SSH remote or a GitHub personal access token (PAT)."
