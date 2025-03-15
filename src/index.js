#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { fetchPullRequestDetails } = require('./github');
const { generateReview } = require('./anthropic');
const { generateMarkdownReport } = require('./markdown-generator');

// Configure CLI
program
  .name('pr-review')
  .description('AI-powered GitHub PR reviewer using Anthropic Claude')
  .version('1.0.0')
  .requiredOption('-u, --url <url>', 'GitHub PR URL')
  .option('-o, --output <path>', 'Output path for the markdown report', './review-report.md')
  .option('-v, --verbose', 'Enable verbose output')
  .helpOption('-h, --help', 'Display help information');

// Parse command line arguments
program.parse(process.argv);

// Display help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
}

const options = program.opts();

async function main() {
  try {
    // Extract repo owner, name, and PR number from URL
    const prUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)(?:\/|$|\?)/; // Enhanced regex
    const match = options.url.match(prUrlPattern);
    
    if (!match) {
      console.error('Invalid GitHub PR URL format. Ensure it follows the pattern: https://github.com/<owner>/<repo>/pull/<number>');
      process.exit(1);
    }
    
    const [, owner, repo, prNumber] = match;
    
    console.log(`Fetching PR details for ${owner}/${repo}#${prNumber}...`);
    
    // Fetch PR details from GitHub
    const prDetails = await fetchPullRequestDetails(owner, repo, prNumber);
    
    if (options.verbose) {
      console.log(`PR Title: ${prDetails.title}`);
      console.log(`Files changed: ${prDetails.files.length}`);
    }
    
    // Generate review using Claude
    console.log('Generating review with Claude...');
    const reviewResults = await generateReview(prDetails);
    
    // Generate markdown report
    console.log('Creating markdown report...');
    const markdownReport = generateMarkdownReport(prDetails, reviewResults);

    // Write to file
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, markdownReport);
    console.log(`Review completed! Report saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
