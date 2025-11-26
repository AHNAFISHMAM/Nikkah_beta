#!/usr/bin/env node
/**
 * Check GitHub repository status
 * Run: node scripts/check-github-status.js
 */

import { execSync } from 'child_process';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getCommandOutput(command) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

log('\n📊 GitHub Repository Status\n', 'bold');
log('='.repeat(60), 'blue');

// Get remote URL
const remoteUrl = getCommandOutput('git remote get-url origin');
if (!remoteUrl) {
  log('❌ No remote configured', 'red');
  process.exit(1);
}

log(`\n🔗 Remote: ${remoteUrl}`, 'cyan');

// Extract repo info
const match = remoteUrl.match(/github\.com[\/:]([\w-]+)\/([\w-]+)/);
if (!match) {
  log('❌ Invalid GitHub remote URL', 'red');
  process.exit(1);
}

const [, username, repo] = match;
const repoUrl = `https://github.com/${username}/${repo}`;

log(`📦 Repository: ${username}/${repo}`, 'cyan');
log(`🌐 URL: ${repoUrl}`, 'cyan');

// Check branch info
log('\n🌿 Branch Information:', 'bold');
const currentBranch = getCommandOutput('git branch --show-current');
const remoteBranch = getCommandOutput('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
const localCommit = getCommandOutput('git rev-parse HEAD');
const remoteCommit = getCommandOutput('git rev-parse origin/main 2>/dev/null');

log(`   Current branch: ${currentBranch}`, 'cyan');
if (remoteBranch) {
  log(`   Tracking: ${remoteBranch}`, 'cyan');
}

// Check if up to date
log('\n📡 Sync Status:', 'bold');
try {
  execSync('git fetch origin --quiet', { stdio: 'pipe' });
  const status = getCommandOutput('git status -sb');
  
  if (status.includes('ahead')) {
    const ahead = status.match(/ahead (\d+)/)?.[1];
    log(`   ⚠️  Local is ${ahead} commit(s) ahead of remote`, 'yellow');
    log(`   💡 Run: git push origin ${currentBranch}`, 'yellow');
  } else if (status.includes('behind')) {
    const behind = status.match(/behind (\d+)/)?.[1];
    log(`   ⚠️  Local is ${behind} commit(s) behind remote`, 'yellow');
    log(`   💡 Run: git pull origin ${currentBranch}`, 'yellow');
  } else if (status.includes('up to date')) {
    log('   ✅ Local and remote are in sync', 'green');
  }
} catch (e) {
  log('   ⚠️  Could not check sync status', 'yellow');
}

// Commit info
log('\n📝 Recent Commits:', 'bold');
const commits = getCommandOutput('git log --oneline -5');
if (commits) {
  commits.split('\n').forEach(line => {
    log(`   ${line}`, 'cyan');
  });
}

// Quick links
log('\n🔗 Quick Links:', 'bold');
log(`   Repository: ${repoUrl}`, 'cyan');
log(`   Settings: ${repoUrl}/settings`, 'cyan');
log(`   Actions: ${repoUrl}/actions`, 'cyan');
log(`   Secrets: ${repoUrl}/settings/secrets/actions`, 'cyan');
log(`   Branches: ${repoUrl}/settings/branches`, 'cyan');

log('\n' + '='.repeat(60), 'blue');
log('');

