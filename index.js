#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const Path = require('path');
const CP = require('child_process');

const cwd = process.cwd();
const homedir = os.homedir();
const packageJson = require(Path.join(cwd, 'package.json'));
const localDependencies = packageJson.localDependencies || {};
const node_modules = (name) => Path.join(cwd, 'node_modules', name);

try { fs.mkdirSync(node_modules('')); } catch (error) {}

for (const name in localDependencies) {
  let existingPath = localDependencies[name];
  if (Path.isAbsolute(existingPath)) {
    // do nothing
  } else if (existingPath.match(/^~/)) {
    existingPath = Path.join(homedir, existingPath.substr(1));
  } else {
    existingPath = Path.join(cwd, existingPath);
  }
  if (!fs.existsSync(existingPath)) {
    console.warn(`WARNING: Specified path doesn't exist: {"${name}": "${localDependencies[name]}"}`)
  }
  const newPath = node_modules(name);
  let exists = true;
  let isSymbolicLink = false;
  try {
    isSymbolicLink = fs.lstatSync(newPath).isSymbolicLink();
  } catch (error) {
    if (error.code === 'ENOENT') exists = false;
    else throw error;
  }
  if (exists && !isSymbolicLink) {
    throw new Error(`Cannot link, path already exists: 'node_modules/${name}'`);
  }
  if (isSymbolicLink) try {
    fs.unlinkSync(newPath);
  } catch (error) {
    throw new Error(`Couldn't remove existing link to 'node_modules/${name}'. ${error.message}`);
  }
  fs.symlinkSync(existingPath, newPath, 'dir');
  console.log(`${existingPath} -> ${newPath}`);
  const sameAsCwd = existingPath === cwd;
  const containsPackageJson = fs.existsSync(Path.join(existingPath, 'package.json'));
  if (!sameAsCwd && containsPackageJson) {
    CP.spawnSync('npm', ['i'], { cwd: existingPath, shell: true, stdio: 'inherit' });
  }
}
