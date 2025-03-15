const { Octokit } = require('@octokit/rest');
const { getDetailedDiff } = require('./git-utils');
const config = require('./config');

// Create Octokit instance with or without auth token
let octokit;

if (config.GITHUB_TOKEN && config.GITHUB_TOKEN.trim() !== '') {
  octokit = new Octokit({
    auth: config.GITHUB_TOKEN
  });
} else {
  octokit = new Octokit();
  console.warn('\x1b[33mWarning: No GitHub token provided. Rate limits will be restricted (60 requests/hour).\x1b[0m');
  console.warn('\x1b[33mFor higher limits (5000 requests/hour), set GITHUB_TOKEN in your .env file.\x1b[0m');
}

// Fetch PR details including files and diffs
async function fetchPullRequestDetails(owner, repo, prNumber) {
  // Get basic PR info
  const { data: prData } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber
  });
  
  // Get files changed
  const { data: filesData } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100 // Adjust if needed for larger PRs
  });
  
  // Get repository info
  const { data: repoData } = await octokit.repos.get({
    owner,
    repo
  });
  
  // Get detailed diff information
  const diffInfo = await getDetailedDiff(
    owner, 
    repo, 
    prData.base.ref, 
    prData.head.ref,
    filesData.map(file => file.filename)
  );
  
  return {
    repository: repoData,
    number: prNumber,
    title: prData.title,
    body: prData.body,
    user: prData.user,
    base: prData.base,
    head: prData.head,
    files: filesData,
    diffInfo: diffInfo
  };
}

module.exports = {
  fetchPullRequestDetails
};
