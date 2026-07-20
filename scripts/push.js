const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN || process.argv[2];

if (!token) {
  console.error("Error: Please provide your GitHub Personal Access Token.");
  process.exit(1);
}

async function main() {
  const dir = path.resolve(__dirname, '..');
  console.log("Pushing repository to GitHub remote (with extended timeout)...");
  
  try {
    const res = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      url: 'https://github.com/gmqazi1036/markazidarulifta.git',
      onAuth: () => ({ username: token }),
      timeout: 300000 // 5 minutes
    });
    console.log("SUCCESS");
    console.log(res);
  } catch (err) {
    console.error("Push failed error details:", err.data || err.message || err);
    process.exit(1);
  }
}

main();
