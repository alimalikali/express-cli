#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter project name:',
            default: 'alidev-express-app',
        },
        {
            type: 'input',
            name: 'projectAuthor',
            message: 'Enter Author name:',
            default: '',
        },
        {
            type: 'confirm',
            name: 'initGit',
            message: 'Initialize Git?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'addDocker',
            message: 'Include Dockerfile?',
            default: false,
        },
    ]);


    const targetDir = path.join(process.cwd(), answers.projectName);

    if (fs.existsSync(targetDir)) {
        console.log(chalk.red(`❌ Directory already exists: ${answers.projectName}`));
        process.exit(1);
    }

    console.log(chalk.blue('📁 Creating project folder...'));
    fs.mkdirSync(targetDir, { recursive: true });
    copyDir(path.join(__dirname, 'template'), targetDir);

    // === Update package.json dynamically ===
    const pkgJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
        const pkgData = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        pkgData.name = answers.projectName;
        pkgData.author = answers.projectAuthor;
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgData, null, 2));
    }
    if (!answers.addDocker) {
        const dockerPath = path.join(targetDir, 'Dockerfile');
        if (fs.existsSync(dockerPath)) fs.unlinkSync(dockerPath);
    }

    if (answers.initGit) {
        console.log(chalk.blue('🔧 Initializing Git...'));
        execSync('git init', { cwd: targetDir, stdio: 'inherit' });
    }

    console.log(chalk.blue('📦 Installing dependencies...'));
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

    console.log(chalk.green(`\n✅ Project created successfully in ./${answers.projectName}`));
    console.log(chalk.green(`👉 cd ${answers.projectName}`));
};

main().catch((err) => {
    console.error(chalk.red('❌ Error creating project:', err));
    process.exit(1);
});