#!/usr/bin/env node
/**
 * Verification script for GitHub setup
 * Run: node scripts/verify-setup.js
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, message, fix = '') {
  if (condition) {
    log(`✅ ${message}`, 'green');
    return true;
  } else {
    log(`❌ ${message}`, 'red');
    if (fix) {
      log(`   💡 ${fix}`, 'yellow');
    }
    return false;
  }
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

function getCommandOutput(command) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

log('\n🔍 GitHub Setup Verification\n', 'bold');
log('='.repeat(50), 'blue');

let allPassed = true;

// Check Git configuration
log('\n📦 Git Configuration:', 'bold');
const gitUser = getCommandOutput('git config user.name');
const gitEmail = getCommandOutput('git config user.email');
allPassed = check(gitUser, `Git user: ${gitUser || 'Not set'}`, 'Run: git config user.name "Your Name"') && allPassed;
allPassed = check(gitEmail, `Git email: ${gitEmail || 'Not set'}`, 'Run: git config user.email "your@email.com"') && allPassed;

// Check remote
log('\n🔗 Git Remote:', 'bold');
const remoteUrl = getCommandOutput('git remote get-url origin');
allPassed = check(
  remoteUrl.includes('github.com'),
  `Remote configured: ${remoteUrl || 'Not set'}`,
  'Run: git remote add origin https://github.com/AHNAFISHMAM/Nikkah_beta.git'
) && allPassed;

// Check branch
log('\n🌿 Git Branch:', 'bold');
const currentBranch = getCommandOutput('git branch --show-current');
allPassed = check(
  currentBranch === 'main',
  `Current branch: ${currentBranch}`,
  'Run: git branch -M main'
) && allPassed;

// Check if up to date
log('\n📡 Repository Status:', 'bold');
const isUpToDate = runCommand('git fetch origin --quiet') && 
                   getCommandOutput('git status -sb').includes('up to date');
allPassed = check(
  isUpToDate,
  'Local branch is up to date with remote',
  'Run: git pull origin main'
) && allPassed;

// Check required files
log('\n📄 Required Files:', 'bold');
const requiredFiles = [
  'package.json',
  'README.md',
  '.gitignore',
  'vite.config.ts',
  'tsconfig.json',
  '.github/workflows/ci.yml',
];

requiredFiles.forEach(file => {
  allPassed = check(
    existsSync(file),
    `${file} exists`,
    `Create ${file}`
  ) && allPassed;
});

// Check environment variables template
log('\n🔐 Environment Variables:', 'bold');
const envExample = existsSync('.env.example');
const envLocal = existsSync('.env.local');
allPassed = check(
  !envLocal || envExample,
  '.env.local exists (or .env.example for reference)',
  'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
) && allPassed;

if (!envExample) {
  log('   ⚠️  Consider creating .env.example for reference', 'yellow');
}

// Check package.json scripts
log('\n📜 Package Scripts:', 'bold');
if (existsSync('package.json')) {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['dev', 'build', 'test', 'lint'];
  requiredScripts.forEach(script => {
    allPassed = check(
      scripts[script],
      `npm run ${script} exists`,
      `Add "${script}" script to package.json`
    ) && allPassed;
  });
}

// Check GitHub Actions
log('\n⚙️  GitHub Actions:', 'bold');
allPassed = check(
  existsSync('.github/workflows/ci.yml'),
  'CI workflow exists',
  'Create .github/workflows/ci.yml'
) && allPassed;

allPassed = check(
  existsSync('.github/workflows/deploy.yml'),
  'Deploy workflow exists',
  'Create .github/workflows/deploy.yml'
) && allPassed;

// Summary
log('\n' + '='.repeat(50), 'blue');
if (allPassed) {
  log('\n✅ All checks passed! Your setup looks good.', 'green');
  log('\n📋 Next Steps:', 'bold');
  log('1. Add GitHub Actions secrets (see .github/SETUP_SECRETS.md)', 'yellow');
  log('2. Set up branch protection (see .github/BRANCH_PROTECTION.md)', 'yellow');
  log('3. Add repository description and topics', 'yellow');
} else {
  log('\n⚠️  Some checks failed. Please fix the issues above.', 'yellow');
  log('\n📚 See QUICK_SETUP_SUMMARY.md for detailed guides.', 'blue');
}
log('');

