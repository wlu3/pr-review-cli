const Anthropic = require("@anthropic-ai/sdk");
const config = require("./config");

// Validate Anthropic API key
if (!config.ANTHROPIC_API_KEY || config.ANTHROPIC_API_KEY.trim() === "") {
  console.error("\x1b[31mError: ANTHROPIC_API_KEY is required in your .env file\x1b[0m");
  process.exit(1);
}

// Check if it's a placeholder key
if (config.ANTHROPIC_API_KEY === "sk-ant-your-actual-anthropic-key") {
  console.error(
    "\x1b[31mError: Please replace the placeholder Anthropic API key in your .env file with your actual key\x1b[0m"
  );
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

// Generate review using Claude
async function generateReview(prDetails) {
  const prompt = buildPrompt(prDetails);

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    system:
      "You are an expert code reviewer. Analyze the provided pull request and identify potential issues, bugs, security vulnerabilities, and areas for improvement. Provide detailed explanations for each issue found.",
  });

  return parseReviewResponse(response);
}

// Build prompt with PR context
function buildPrompt(prDetails) {
  let prompt = `
You are an expert code reviewer analyzing a GitHub pull request. Your task is to identify potential issues, bugs, security vulnerabilities, and areas for improvement.

## Repository Context
Repository: ${prDetails.repository.full_name}
Description: ${prDetails.repository.description || "No description provided"}

## Pull Request Information
Title: ${prDetails.title}
Description: ${prDetails.body || "No description provided"}
Author: ${prDetails.user.login}
Base Branch: ${prDetails.base.ref}
Head Branch: ${prDetails.head.ref}

## Files Changed
${prDetails.diffInfo
  .map((file) => `- ${file.path} (${file.additions} additions, ${file.deletions} deletions)`)
  .join("\n")}

## Code Changes
`;

  // Add detailed diff information with precise line numbers
  prDetails.diffInfo.forEach((file) => {
    prompt += `\n### File: ${file.path}\n`;

    file.chunks.forEach((chunk) => {
      prompt += `\n#### Changes starting at line ${chunk.startLine}:\n\`\`\`\n`;

      chunk.lines.forEach((line) => {
        const prefix = line.type === "addition" ? "+" : line.type === "deletion" ? "-" : " ";
        const lineInfo = line.lineNumber ? ` (line ${line.lineNumber})` : "";
        prompt += `${prefix}${line.content}${line.type === "addition" ? lineInfo : ""}\n`;
      });

      prompt += "```\n";
    });
  });

  // Add review instructions
  prompt += `
## Review Instructions
Please analyze the code changes and provide a detailed review that includes:

1. A summary of the changes and their purpose
2. Potential bugs or logical errors
3. Security vulnerabilities
4. Performance considerations
5. Code style and best practices
6. Documentation completeness
7. Suggestions for improvement

For each issue found, provide:
- A clear title for the issue
- A detailed description explaining the problem
- The file location and line number (be very precise using the line numbers provided)
- The severity level (Critical, High, Medium, Low)
- A specific suggestion for how to fix it

Format your response as a structured JSON object with the following schema:
{
  "summary": "Overall assessment of the PR",
  "issues": [
    {
      "title": "Issue title",
      "description": "Detailed explanation",
      "severity": "Critical|High|Medium|Low",
      "fileLocation": "path/to/file.js",
      "lineNumber": 42,
      "code": "The problematic code snippet",
      "suggestion": "Recommended fix or improvement"
    }
  ]
}`;

  return prompt;
}

// Parse structured response
function parseReviewResponse(response) {
  try {
    // Extract the JSON part from Claude's response
    const content = response.content[0].text;
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);

    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Claude response:", error);
    // Fallback to returning the raw text if JSON parsing fails
    return {
      summary: "Error parsing structured response. See raw output below.",
      issues: [],
      rawOutput: response.content[0].text,
    };
  }
}

module.exports = {
  generateReview,
};
