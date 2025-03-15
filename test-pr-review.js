#!/usr/bin/env node

// This is a test script to demonstrate how to use the PR Review CLI
// without actually running it (since we don't have valid API keys)

console.log(`
PR Review CLI - Usage Examples
=============================

Example 1: Reviewing a public repository PR
------------------------------------------
$ node src/index.js --url https://github.com/facebook/react/pull/25000 --output react-pr-review.md

This will:
  1. Fetch PR details from GitHub (with rate limit of 60 requests/hour without a token)
  2. Clone the repository and analyze the git diff
  3. Send the PR content to Claude for analysis
  4. Generate a markdown report with review results
  5. Save the report to react-pr-review.md

Example 2: Using a GitHub token for higher rate limits
-----------------------------------------------------
$ export GITHUB_TOKEN=your_github_token
$ node src/index.js --url https://github.com/facebook/react/pull/25000 --output react-pr-review.md

With a GitHub token:
  - Rate limit increases to 5000 requests/hour
  - You can access private repositories you have access to

Example 3: Enabling verbose output
---------------------------------
$ node src/index.js --url https://github.com/facebook/react/pull/25000 --verbose

This will show additional information during the review process, including:
  - PR title and number of files changed
  - Detailed error messages if something goes wrong

Note: To use this tool, you need to:
  1. Set up your .env file with your Anthropic API key (required)
  2. Optionally add your GitHub token for higher rate limits
  3. Make sure you have Git installed and configured
  `);
