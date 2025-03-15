# PR Review CLI

An AI-powered GitHub Pull Request reviewer using Anthropic's Claude model. This command-line tool analyzes GitHub pull requests, identifies potential issues, and generates a detailed markdown report with suggestions for improvements.

## Features

- Fetches PR details from GitHub including files changed and diff information
- Uses git tools to accurately locate code changes
- Sends PR content to Anthropic's Claude for expert code review
- Generates a comprehensive markdown report with:
  - Summary of the PR
  - Identified issues categorized by severity
  - Detailed explanations and suggestions for each issue
  - File and line references for easy navigation

## Prerequisites

- Node.js (v14 or higher)
- Git installed and configured
- Anthropic API Key (required)
- GitHub Personal Access Token with repo scope (optional for public repositories, but recommended for higher rate limits)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/pr-review-cli.git
   cd pr-review-cli
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your API keys:

   **Option 1: Using environment variables (recommended)**

   ```bash
   # Set in your shell
   export ANTHROPIC_API_KEY=your_anthropic_api_key
   export GITHUB_TOKEN=your_github_token  # Optional for public repositories
   ```

   **Option 2: Using a .env file**

   ```
   # Create a .env file in the project root
   GITHUB_TOKEN=your_github_token  # Optional for public repositories
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Make the CLI executable:

   ```bash
   chmod +x src/index.js
   ```

5. (Optional) Install globally:

   ```bash
   npm link
   ```

## Usage

```bash
# Basic usage
node src/index.js --url https://github.com/owner/repo/pull/123

# Specify output file
node src/index.js --url https://github.com/owner/repo/pull/123 --output my-review.md

# Enable verbose logging
node src/index.js --url https://github.com/owner/repo/pull/123 --verbose

# If installed globally
pr-review --url https://github.com/owner/repo/pull/123
```

## Example Output

The tool generates a markdown report with the following sections:

1. **PR Information**: Repository, PR number, author, and review date
2. **Summary**: Overall assessment of the PR
3. **Issues Found**: Categorized by severity (Critical, High, Medium, Low)
   - Each issue includes:
     - Title and description
     - File location and line number
     - Code snippet
     - Suggested fix
4. **Files Changed**: List of modified files with addition/deletion counts

## How It Works

1. The tool extracts the repository owner, name, and PR number from the provided URL
2. It fetches PR details from the GitHub API
3. It clones the repository to a temporary directory and analyzes the git diff
4. The PR content and diff information are sent to Claude for analysis
5. Claude's response is parsed and formatted into a markdown report
6. The report is saved to the specified output file
7. The temporary repository clone is automatically cleaned up

> **Note:** The tool creates a temporary clone of the repository during analysis, but automatically removes it once the review is complete, ensuring no unnecessary files are left behind.

## Limitations

- The tool currently supports up to 100 files per PR (can be adjusted in the code)
- Very large PRs may exceed Claude's context window
- For private repositories, a GitHub Personal Access Token with repo scope is required
- Without a GitHub token, API rate limits are restricted to 60 requests/hour (vs 5000 requests/hour with a token)
- Rate limits apply for both GitHub and Anthropic APIs

## License

MIT
