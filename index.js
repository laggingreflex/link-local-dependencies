#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const Path = require('path');

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
  const newPath = node_modules(name);
  if (fs.existsSync(newPath)) {
    const stats = fs.lstatSync(newPath);
    if (!stats.isSymbolicLink()) {
      throw new Error(`Cannot link to 'node_modules/${name}', path already exists`);
    } else {
      try {
        fs.unlinkSync(newPath);
      } catch (error) {
        throw new Error(`Couldn't remove existing link to 'node_modules/${name}'. ${error.message}`);
      }
    }
  }
  fs.symlinkSync(existingPath, newPath, 'dir');
  console.log(`${existingPath} -> ${newPath}`);
}
