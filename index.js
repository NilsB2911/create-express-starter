#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import {exec, execSync} from 'child_process'
import inquirer from 'inquirer'
import os from 'os'
import figlet from 'figlet'
import gradient from 'gradient-string'
import {createSpinner} from 'nanospinner'

const verbose = process.argv[2] === 'verbose'

async function getProjectName() {
    const answers = await inquirer.prompt({
        name: 'projectName',
        type: 'input',
        message: 'Project name:',
        default() {
            return 'express-starter'
        }
    })
    return answers.projectName
}

async function getPackageManager() {
    const answers = await inquirer.prompt({
        name: 'manager',
        type: 'list',
        message: 'Which package manager do you wanna use:',
        choices: ['yarn', 'npm'],
    })
    return answers.manager
}

async function getUsername() {
    const answers = await inquirer.prompt({
        name: 'manager',
        type: 'input',
        message: 'Author:',
        default() {
            return os.userInfo().username
        }
    })
    return answers.manager
}

async function getPort() {
    const answers = await inquirer.prompt({
        name: 'port',
        type: 'input',
        message: 'Express port:',
        default() {
            return '3001'
        }
    })
    return answers.port
}

const p = new Promise((resolve) => {
    figlet('create-express-starter', (err, data) => {
        if (err) {
            console.dir(err)
            return
        }
        resolve(data)
    })
})

const fig = await p
console.log(gradient.fruit(fig))

const name = await getProjectName()
const manager = await getPackageManager()
const author = await getUsername()
const port = await getPort()
const currentDir = process.cwd();

if (!fs.existsSync(path.join(currentDir, name))) {
    fs.mkdirSync(path.join(currentDir, name))
}

const gitSpinner = createSpinner('Cloning...')
gitSpinner.spin()
const git = new Promise((resolve, reject) => {
    try {
        exec(`git clone --depth=1 https://github.com/NilsB2911/express-starter.git ${path.join(currentDir, name)}`, (error, stdout, stderr) => {
            if (error) reject(error)
            resolve('done')
        })
    } catch (e) {
        reject(e)
    }
})

await git
gitSpinner.success({text: 'Cloned'})
setTimeout(() => {
    const rawJson = fs.readFileSync(`${path.join(currentDir, name)}/package.json`);
    const packageJson = JSON.parse(rawJson.toString())
    packageJson.name = name
    packageJson.version = '1.0.0'
    packageJson.author = author
    fs.writeFileSync(`${path.join(currentDir, name)}/package.json`, JSON.stringify(packageJson))
    const mngSpinner = createSpinner('Installing dependencies')
    mngSpinner.spin()
    execSync(`cd ${path.join(currentDir, name)} && ${manager} install`, {stdio: verbose ? 'inherit' : 'ignore'})
    mngSpinner.success({text: `Installed using ${manager}`})
    execSync(`cd ${path.join(currentDir, name)} && rm -rf .git`, {stdio: verbose ? 'inherit' : 'ignore'})
    execSync(`cd ${path.join(currentDir, name)} && ${manager === 'npm' ? 'npm run' : manager} format`, {stdio: verbose ? 'inherit' : 'ignore'})
    fs.writeFileSync(`${path.join(currentDir, name)}/.env`, `PORT=${port}`)
}, 1000)