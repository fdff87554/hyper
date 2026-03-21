#!/usr/bin/env node
'use strict';

/**
 * Synchronizes the version field across root and app package.json files,
 * then creates a git tag for the new version.
 *
 * Usage:
 *   node bin/bump-version.js           # bump prerelease (canary.5 -> canary.6)
 *   node bin/bump-version.js 4.0.0     # set explicit version
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const ROOT_PKG = path.join(__dirname, '..', 'package.json');
const APP_PKG = path.join(__dirname, '..', 'app', 'package.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function bumpPrerelease(version) {
  const match = version.match(/^(.+?)(\d+)$/);
  if (!match) {
    console.error(`Cannot auto-bump version: ${version}`);
    console.error('Provide an explicit version as argument.');
    process.exit(1);
  }
  return match[1] + (parseInt(match[2], 10) + 1);
}

const explicitVersion = process.argv[2];
const rootPkg = readJson(ROOT_PKG);
const currentVersion = rootPkg.version;
const newVersion = explicitVersion || bumpPrerelease(currentVersion);

console.log(`${currentVersion} -> ${newVersion}`);

rootPkg.version = newVersion;
writeJson(ROOT_PKG, rootPkg);

const appPkg = readJson(APP_PKG);
appPkg.version = newVersion;
writeJson(APP_PKG, appPkg);

console.log('Updated package.json and app/package.json');

try {
  execSync(`git add package.json app/package.json`, {stdio: 'inherit'});
  execSync(`git commit -m "release: v${newVersion}"`, {stdio: 'inherit'});
  execSync(`git tag "v${newVersion}"`, {stdio: 'inherit'});
  console.log(`Tagged v${newVersion}`);
  console.log(`\nTo publish: git push origin canary --tags`);
} catch (err) {
  console.error('Git operations failed:', err.message);
  process.exit(1);
}
