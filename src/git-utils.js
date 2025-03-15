const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

// Get detailed diff with context
async function getDetailedDiff(owner, repo, baseBranch, headBranch, filePaths) {
  // Create temporary directory
  const tempDir = path.join(os.tmpdir(), `pr-review-${Date.now()}`);
  console.log(`Creating temporary clone in: ${tempDir}`);
  
  try {
    // Clone repository
    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    await cloneRepository(repoUrl, headBranch, tempDir);
    
    // Get detailed diff
    const diffOutput = execSync(
      `cd ${tempDir} && git diff origin/${baseBranch}...HEAD --unified=3 -- ${filePaths.map(p => `"${p}"`).join(' ')}`,
      { maxBuffer: 10 * 1024 * 1024 } // Increase buffer for large diffs
    ).toString();
    
    return parseDiffOutput(diffOutput);
  } catch (error) {
    console.error('Error during diff analysis:', error.message);
    throw error;
  } finally {
    // Clean up temporary directory
    console.log(`Cleaning up temporary clone: ${tempDir}`);
    try {
      await fs.remove(tempDir);
      console.log('Temporary clone removed successfully');
    } catch (cleanupError) {
      console.error('Error cleaning up temporary directory:', cleanupError.message);
      // Don't throw the cleanup error, as it would mask the original error
    }
  }
}

// Clone repository to temporary directory
async function cloneRepository(repoUrl, branch, tempDir) {
  try {
    // For public repositories, this will work without authentication
    execSync(`git clone --branch ${branch} --single-branch ${repoUrl} ${tempDir}`);
    return tempDir;
  } catch (error) {
    // If the clone fails, it might be due to authentication issues
    console.error('Error cloning repository:', error.message);
    console.error('If this is a private repository, make sure you have provided a valid GitHub token in your .env file.');
    throw new Error('Failed to clone repository. Check your GitHub token and repository permissions.');
  }
}

// Parse git diff output into structured format
function parseDiffOutput(diffOutput) {
  // Parse the diff output into a structured format
  // that includes file paths, line numbers, and context
  const files = [];
  let currentFile = null;
  
  // Split by diff headers
  const diffChunks = diffOutput.split('diff --git ');
  
  for (const chunk of diffChunks.slice(1)) {
    // Parse file information
    const fileMatch = chunk.match(/a\/(.*) b\/(.*)/);
    if (fileMatch) {
      currentFile = {
        path: fileMatch[2],
        chunks: [],
        additions: 0,
        deletions: 0
      };
      files.push(currentFile);
      
      // Parse hunks
      const hunkRegex = /@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/g;
      let hunkMatch;
      
      while ((hunkMatch = hunkRegex.exec(chunk)) !== null) {
        const hunkStartLine = parseInt(hunkMatch[3]);
        const hunkEndIndex = chunk.indexOf('@@ -', hunkMatch.index + 1);
        const hunkContent = chunk.slice(
          hunkMatch.index + hunkMatch[0].length,
          hunkEndIndex !== -1 ? hunkEndIndex : undefined
        );
        
        // Process lines in the hunk
        const lines = hunkContent.split('\n').filter(line => line.length > 0);
        let lineNumber = hunkStartLine;
        
        const hunkLines = lines.map(line => {
          const type = line[0] === '+' ? 'addition' : 
                      line[0] === '-' ? 'deletion' : 'context';
          
          // Only increment line number for context and additions
          const result = {
            content: line.substring(1),
            type,
            lineNumber: type !== 'deletion' ? lineNumber : null
          };
          
          if (type !== 'deletion') lineNumber++;
          if (type === 'addition') currentFile.additions++;
          if (type === 'deletion') currentFile.deletions++;
          
          return result;
        });
        
        currentFile.chunks.push({
          startLine: hunkStartLine,
          lines: hunkLines
        });
      }
    }
  }
  
  return files;
}

module.exports = {
  getDetailedDiff,
  cloneRepository
};
