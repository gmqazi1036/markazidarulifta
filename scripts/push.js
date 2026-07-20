const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN || process.argv[2];

if (!token) {
  console.error("Error: Please provide your GitHub Personal Access Token.");
  console.error("Usage: GITHUB_TOKEN=your_token node scripts/push.js");
  console.error("  or: node scripts/push.js your_token");
  process.exit(1);
}

async function main() {
  const dir = path.resolve(__dirname, '..');
  console.log("Pushing to GitHub remote...");
  
  try {
    const res = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      url: 'https://github.com/gmqazi1036/markazidarulifta.git',
      onAuth: () => ({ username: token, password: '' })
    });
    console.log("Successfully pushed to GitHub!");
    console.log(res);
  } catch (err) {
    console.error("Push failed:", err);
    process.exit(1);
  }
}

main();
