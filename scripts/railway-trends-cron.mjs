#!/usr/bin/env node
/**
 * ToolShoppy — Railway monthly trends cron
 *
 * Railway cron schedule example: 0 6 1 * *  (1st of month, 06:00 UTC)
 *
 * Required env:
 *   GITHUB_TOKEN   — PAT with repo Contents read/write
 *   GITHUB_REPO    — e.g. youruser/toolshoppy
 *
 * Optional:
 *   GITHUB_BRANCH  — default master
 *   TRENDS_CSV_URL — direct URL to latest Google Trends CSV export
 *   GIT_USER_NAME  — default ToolShoppy Trends Bot
 *   GIT_USER_EMAIL — default bot@toolshoppy.com
 *   SKIP_GIT_PUSH  — 1 = sync only, no git
 *
 * Local:  SKIP_GIT_PUSH=1 npm run cron:trends
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { LANDING_PAGES } from './trends-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

function log(msg) {
  console.log(`[trends-cron] ${new Date().toISOString()} ${msg}`);
}

function sh(cmd, cwd, silent) {
  execSync(cmd, { cwd, stdio: silent ? 'pipe' : 'inherit' });
}

function shOut(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8' }).trim();
}

function gitPathsToStage() {
  const paths = new Set([
    'assets/data/google-trends.csv',
    'assets/js/trends-data.js',
    'assets/js/trends-seo.js',
    'sitemap.xml',
    '_redirects',
    'index.html',
  ]);
  for (const page of LANDING_PAGES) {
    paths.add(page.path.replace(/^\//, '').replace(/\/$/, '') + '/index.html');
  }
  return [...paths];
}

function cloneRepo() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'master';
  if (!token || !repo) {
    throw new Error('GITHUB_TOKEN and GITHUB_REPO are required');
  }

  const workDir = path.join(os.tmpdir(), 'toolshoppy-trends-sync');
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  const cloneUrl = `https://x-access-token:${token}@github.com/${repo}.git`;
  log(`Cloning ${repo} (${branch}) …`);
  sh(`git clone --branch ${branch} --single-branch --depth 1 ${JSON.stringify(cloneUrl)} ${JSON.stringify(workDir)}`, REPO_ROOT, true);

  sh(`git config user.name ${JSON.stringify(process.env.GIT_USER_NAME || 'ToolShoppy Trends Bot')}`, workDir, true);
  sh(`git config user.email ${JSON.stringify(process.env.GIT_USER_EMAIL || 'bot@toolshoppy.com')}`, workDir, true);

  return { workDir, branch };
}

function runSync(workDir) {
  log('Running sync-trends-seo.mjs …');
  const result = spawnSync('node', ['scripts/sync-trends-seo.mjs'], {
    cwd: workDir,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`sync failed with exit code ${result.status}`);
  }
}

function commitAndPush(workDir, branch) {
  const paths = gitPathsToStage().filter((p) => fs.existsSync(path.join(workDir, p)));
  for (const p of paths) {
    sh(`git add ${JSON.stringify(p)}`, workDir, true);
  }

  const status = shOut('git status --porcelain', workDir);
  if (!status) {
    log('No changes — CSV and SEO assets already up to date.');
    return false;
  }

  const date = new Date().toISOString().slice(0, 10);
  sh(`git commit -m ${JSON.stringify(`chore: automated monthly trends SEO sync (${date})`)}`, workDir, true);
  sh(`git push origin ${branch}`, workDir);
  log('Pushed to GitHub. Cloudflare Pages will deploy automatically.');
  return true;
}

async function main() {
  log('Starting monthly trends cron');

  const skipGit = process.env.SKIP_GIT_PUSH === '1' || process.env.SKIP_GIT_PUSH === 'true';
  const workDir = skipGit ? REPO_ROOT : cloneRepo().workDir;
  const branch = process.env.GITHUB_BRANCH || 'master';

  runSync(workDir);

  if (skipGit) {
    log('SKIP_GIT_PUSH — sync done, no git push.');
    return;
  }

  commitAndPush(workDir, branch);
  log('Done.');
}

main().catch((err) => {
  console.error('[trends-cron] FATAL:', err.message || err);
  process.exit(1);
});
