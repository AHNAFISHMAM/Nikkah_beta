#!/usr/bin/env node
/**
 * Find files that should be committed but aren't
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Read .gitignore patterns
function getGitignorePatterns() {
  if (!existsSync('.gitignore')) return [];
  const content = readFileSync('.gitignore', 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// Check if file should be ignored
function shouldIgnore(filePath, patterns) {
  const normalized = filePath.replace(/\\/g, '/');
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(normalized);
    }
    return normalized.includes(pattern);
  });
}

// Get all tracked files
function getTrackedFiles() {
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    return new Set(output.trim().split('\n').filter(Boolean));
  } catch {
    return new Set();
  }
}

// Recursively get all files
function getAllFiles(dir, baseDir = dir, patterns = [], tracked = new Set(), results = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = fullPath.replace(baseDir + '\\', '').replace(baseDir + '/', '');
      
      // Skip .git directory
      if (entry.name === '.git') continue;
      
      // Check if should be ignored
      if (shouldIgnore(relativePath, patterns)) continue;
      
      if (entry.isDirectory()) {
        getAllFiles(fullPath, baseDir, patterns, tracked, results);
      } else if (entry.isFile()) {
        // Check if not tracked
        if (!tracked.has(relativePath.replace(/\\/g, '/'))) {
          results.push(relativePath);
        }
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  
  return results;
}

// Main
log('\n🔍 Finding Untracked Files\n', 'bold');
log('='.repeat(60), 'cyan');

const patterns = getGitignorePatterns();
const tracked = getTrackedFiles();
const untracked = getAllFiles('.', '.', patterns, tracked);

// Filter out files that should be ignored
const shouldCommit = untracked.filter(file => {
  // These should never be committed
  const neverCommit = [
    '.env',
    '.env.local',
    'node_modules',
    'dist',
    '.next',
    'nul',
    'coverage',
  ];
  
  return !neverCommit.some(pattern => file.includes(pattern));
});

if (shouldCommit.length === 0) {
  log('\n✅ All important files are already tracked!', 'green');
  log('\n📋 Ignored files (correctly not committed):', 'bold');
  log('   - .env, .env.local (secrets)', 'yellow');
  log('   - node_modules/ (dependencies)', 'yellow');
  log('   - dist/ (build output)', 'yellow');
  log('   - .next/ (Next.js build, not used in Vite)', 'yellow');
  log('   - coverage/ (test coverage)', 'yellow');
} else {
  log(`\n📄 Found ${shouldCommit.length} untracked file(s):\n`, 'yellow');
  shouldCommit.forEach(file => {
    log(`   - ${file}`, 'cyan');
  });
  log('\n💡 To add these files:', 'bold');
  log('   git add ' + shouldCommit.join(' '), 'green');
  log('   git commit -m "Add missing files"', 'green');
  log('   git push origin main', 'green');
}

log('\n' + '='.repeat(60), 'cyan');
log('');

