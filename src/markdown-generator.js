// Generate markdown report from review results
function generateMarkdownReport(prDetails, reviewResults) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  let markdown = `# PR Review: ${prDetails.title}\n\n`;
  
  // Add PR metadata
  markdown += `## Pull Request Information\n\n`;
  markdown += `- **Repository:** ${prDetails.repository.full_name}\n`;
  markdown += `- **PR Number:** #${prDetails.number}\n`;
  markdown += `- **Author:** ${prDetails.user.login}\n`;
  markdown += `- **Review Date:** ${timestamp}\n\n`;
  
  // Add summary
  markdown += `## Summary\n\n${reviewResults.summary}\n\n`;
  
  // Add issues section if there are any
  if (reviewResults.issues && reviewResults.issues.length > 0) {
    markdown += `## Issues Found (${reviewResults.issues.length})\n\n`;
    
    // Group issues by severity
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    
    for (const severity of severities) {
      const issuesWithSeverity = reviewResults.issues.filter(
        issue => issue.severity.toLowerCase() === severity.toLowerCase()
      );
      
      if (issuesWithSeverity.length > 0) {
        markdown += `### ${severity} Severity (${issuesWithSeverity.length})\n\n`;
        
        issuesWithSeverity.forEach((issue, index) => {
          markdown += `#### ${index + 1}. ${issue.title}\n\n`;
          markdown += `- **File:** ${issue.fileLocation}\n`;
          markdown += `- **Line:** ${issue.lineNumber}\n`;
          markdown += `- **Description:** ${issue.description}\n\n`;
          
          if (issue.code) {
            markdown += `**Code:**\n\`\`\`\n${issue.code}\n\`\`\`\n\n`;
          }
          
          if (issue.suggestion) {
            markdown += `**Suggestion:**\n${issue.suggestion}\n\n`;
          }
          
          markdown += `---\n\n`;
        });
      }
    }
  } else {
    markdown += `## Issues Found\n\nNo issues were identified in this pull request.\n\n`;
  }
  
  // Add files changed section
  markdown += `## Files Changed\n\n`;
  prDetails.diffInfo.forEach(file => {
    markdown += `- ${file.path} (${file.additions} additions, ${file.deletions} deletions)\n`;
  });
  
  return markdown;
}

module.exports = {
  generateMarkdownReport
};
