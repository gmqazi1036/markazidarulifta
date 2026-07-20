const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'gmqazi1036';
const REPO = 'markazidarulifta';
const BRANCH = 'main';

if (!TOKEN) {
  console.error("Missing GITHUB_TOKEN environment variable.");
  process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '..');

async function ghFetch(endpoint, options = {}) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'MarkaziDarulIfta-Pusher',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    }
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`GitHub API Error [${res.status}]: ${JSON.stringify(body)}`);
  }
  return body;
}

const IGNORED_PATHS = [
  'node_modules',
  'node-env',
  'node-git-tools',
  '.next',
  '.vercel',
  '.git',
  '.env',
  'prisma/dev.db'
];

function shouldIgnore(relPath) {
  return IGNORED_PATHS.some(ign => relPath === ign || relPath.startsWith(ign + '/'));
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(ROOT_DIR, fullPath);
    if (shouldIgnore(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push({ fullPath, relPath });
    }
  }
  return fileList;
}

async function main() {
  console.log(`Starting GitHub Git Data API push for ${OWNER}/${REPO}...`);

  // 1. Initialize repo if empty by creating .gitignore via Contents API
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath).toString('base64');
  
  console.log("Initializing repository with .gitignore...");
  try {
    await ghFetch('/contents/.gitignore', {
      method: 'PUT',
      body: JSON.stringify({
        message: 'chore: initialize repository with .gitignore',
        content: gitignoreContent,
        branch: BRANCH
      })
    });
    console.log("Repository initialized successfully.");
  } catch (err) {
    console.log("Initialization note (file may already exist):", err.message);
  }

  // 2. Fetch latest commit SHA on main
  console.log(`Fetching latest commit on ${BRANCH}...`);
  const refRes = await ghFetch(`/git/ref/heads/${BRANCH}`);
  const parentCommitSha = refRes.object.sha;
  const parentCommitRes = await ghFetch(`/git/commits/${parentCommitSha}`);
  const baseTreeSha = parentCommitRes.tree.sha;

  // 3. Upload all blobs
  const files = getAllFiles(ROOT_DIR);
  console.log(`Found ${files.length} files to upload.`);

  const treeEntries = [];

  for (let i = 0; i < files.length; i++) {
    const { fullPath, relPath } = files[i];
    console.log(`[${i + 1}/${files.length}] Uploading blob: ${relPath}`);

    const fileBuffer = fs.readFileSync(fullPath);
    const isBinary = fileBuffer.some(b => b === 0);

    const blobData = isBinary ? {
      content: fileBuffer.toString('base64'),
      encoding: 'base64'
    } : {
      content: fileBuffer.toString('utf-8'),
      encoding: 'utf-8'
    };

    const blobRes = await ghFetch('/git/blobs', {
      method: 'POST',
      body: JSON.stringify(blobData)
    });

    treeEntries.push({
      path: relPath,
      mode: '100644',
      type: 'blob',
      sha: blobRes.sha
    });
  }

  console.log(`Creating Git Tree with ${treeEntries.length} entries...`);
  const treeRes = await ghFetch('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries
    })
  });

  console.log(`Creating commit...`);
  const commitRes = await ghFetch('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: 'feat: initial commit of Markazi Darul Ifta web application',
      tree: treeRes.sha,
      parents: [parentCommitSha]
    })
  });

  console.log(`Updating branch ref refs/heads/${BRANCH}...`);
  await ghFetch(`/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: commitRes.sha,
      force: true
    })
  });

  console.log(`\n🎉 SUCCESS! All files successfully pushed to https://github.com/${OWNER}/${REPO} on branch '${BRANCH}'!`);
}

main().catch(err => {
  console.error("Upload failed:", err);
  process.exit(1);
});
