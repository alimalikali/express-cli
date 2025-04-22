#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const main = async () => {
  const answers = await inquirer.prompt([
    { type: 'confirm', name: 'initGit', message: 'Initialize Git?', default: true },
    { type: 'confirm', name: 'addDocker', message: 'Include Dockerfile?', default: false },
  ]);

  const targetDir = path.join(process.cwd(), 'express-app');
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Directory already exists: ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  copyDir(path.join(__dirname, 'template'), targetDir);

  if (!answers.addDocker) fs.unlinkSync(path.join(targetDir, 'Dockerfile'));
  if (answers.initGit) execSync('git init', { cwd: targetDir, stdio: 'inherit' });

  console.log('✅ Express boilerplate generated at ./express-app');
};

main();
