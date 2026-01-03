#!/usr/bin/env node
/**
 * G88 Version Bump Script
 * Synchronizes version across package.json and build.gradle
 * 
 * Usage:
 *   node scripts/bump-version.js patch   # 1.0.0 -> 1.0.1
 *   node scripts/bump-version.js minor   # 1.0.0 -> 1.1.0
 *   node scripts/bump-version.js major   # 1.0.0 -> 2.0.0
 *   node scripts/bump-version.js 1.2.3   # Set specific version
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const BUILD_GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function bumpVersion(currentVersion, type) {
  const parsed = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      return formatVersion({ major: parsed.major + 1, minor: 0, patch: 0 });
    case 'minor':
      return formatVersion({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
    case 'patch':
      return formatVersion({ major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 });
    default:
      // Assume it's a specific version
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type;
      }
      throw new Error(`Invalid version type: ${type}`);
  }
}

function getCurrentVersionCode() {
  const gradleContent = readFile(BUILD_GRADLE_PATH);
  const match = gradleContent.match(/versionCode\s+(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(readFile(PACKAGE_JSON_PATH));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  return oldVersion;
}

function updateBuildGradle(newVersion, newVersionCode) {
  let gradleContent = readFile(BUILD_GRADLE_PATH);
  
  // Update versionCode
  gradleContent = gradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${newVersionCode}`
  );
  
  // Update versionName
  gradleContent = gradleContent.replace(
    /versionName\s+"[^"]+"/,
    `versionName "${newVersion}"`
  );
  
  writeFile(BUILD_GRADLE_PATH, gradleContent);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node bump-version.js [patch|minor|major|x.y.z]');
    process.exit(1);
  }
  
  const bumpType = args[0];
  
  try {
    // Get current version from package.json
    const packageJson = JSON.parse(readFile(PACKAGE_JSON_PATH));
    const currentVersion = packageJson.version || '0.0.1';
    const currentVersionCode = getCurrentVersionCode();
    
    // Calculate new version
    const newVersion = bumpVersion(currentVersion, bumpType);
    const newVersionCode = currentVersionCode + 1;
    
    console.log('\n📱 G88 Version Bump');
    console.log('==================');
    console.log(`  Version: ${currentVersion} → ${newVersion}`);
    console.log(`  Code:    ${currentVersionCode} → ${newVersionCode}`);
    console.log('');
    
    // Update files
    updatePackageJson(newVersion);
    console.log('  ✅ Updated package.json');
    
    updateBuildGradle(newVersion, newVersionCode);
    console.log('  ✅ Updated build.gradle');
    
    console.log('\n✨ Version bump complete!');
    console.log(`\n  New version: ${newVersion} (${newVersionCode})`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
