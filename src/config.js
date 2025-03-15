// Load environment variables from .env file, but don't override existing env vars
require('dotenv').config({ override: false });

// Validate required environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\x1b[31mError: ANTHROPIC_API_KEY is required in your environment\x1b[0m');
  process.exit(1);
}

module.exports = {
  // GitHub token is optional for public repositories
  // Only use the token if it's defined and not empty
  GITHUB_TOKEN: process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '' 
    ? process.env.GITHUB_TOKEN 
    : undefined,
  
  // Anthropic API key is required
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
};

// Log info about where credentials are coming from
console.log(`Using credentials from: ${process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-your') ? '.env file (placeholder)' : 'system environment'}`);
