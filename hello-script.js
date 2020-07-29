#!/usr/bin/env node

const childProcessExec = require('child_process').exec;

const {spawnSync} = require('child_process');
const util = require('util');
const { exit } = require('process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const exec = util.promisify(childProcessExec);

// Emojis

const done = String.fromCodePoint("0x2705")
const running = String.fromCodePoint("0x1F3C3")
const finish = String.fromCodePoint("0x1f389")
const cross = String.fromCodePoint("0x274C")
const warning = String.fromCodePoint("0x26A0")
const wave = String.fromCodePoint("0x1F44B")
const question = String.fromCodePoint("0x2049")
const thumb = String.fromCodePoint("0x1F44D")

/**
 * Path to the repo that you want to run updates.
 */

const repoPath = ""

/**
 * Script that you want to run after updating [yarn | bundle install | yarn start | bin/setup --reset].
 * Need to be in order
 */

const buildScrips = [
  {command: "", flag: ""},
  {command: "", flag: ""}
]

/**
 * Entry function prepare local environment for work
 */

prepareToWork()

async function prepareToWork() {
  const currentStatus = await getCurrentStatus()

  if (currentStatus === 0 ) {
      console.log(`${thumb} Status clean, moving to master\n\n`)
      const currentBranch = await getCurrentBranch()

      var masterPulled = 1 
      if (currentBranch === "master") {
        console.log(`${thumb} Already on master\n\n`)
        masterPulled = await pullMaster()
      } else {
        await checkoutMaster()
        masterPulled = await pullMaster()
      }

      if (masterPulled === 0) {
        const scriptFinished = await runRepoScripts()
        console.log(`${finish} You are ready for work!`)
        exit(scriptFinished)
      } else {
        exit(masterPulled)
      }

  } else {
     console.log(`${question} Status dirty, need to reset before moving master\n\n`)
     var answer = "no"

     await rl.question(
       `${warning} Do you want to reset changes and move to master? [Yes/No]\n\n${warning} This will hard reset your changes.\n\n`,
      async (a) => {
        answer = a.toString().toLowerCase()
        if (answer === "yes" || answer === "y") {
          await resetChanges()
          await checkoutMaster()
          const masterPulled = await pullMaster()
          if (masterPulled === 0) {
            const scriptFinished = await runRepoScripts()
            console.log(`${finish} You are ready for work!`, scriptFinished)
            exit(scriptFinished)
          } else {
            exit(masterPulled)
          }
        } else {
          console.log(`${wave} Alright, Bye bye!`)
          exit(1)
        }
        rl.close();
    })
  }
}

async function runScript(script) {
    console.log(`${running} Running ${script.command} ${script.flag}`)
    const childProcess = await spawnSync(script.command, [script.flag], {cwd: repoPath, stdio: 'inherit' })
    return childProcess
}

/**
 * Run repo scipts
 */


async function runRepoScripts() {
  console.log(`${running} Running scripts ..\n\n`)

  for (const script of buildScrips) {
    const script_log = await runScript(script);
  }
  console.log(`${finish} No more scripts!!`);
  return 0
}

/**
 * Hard reset changes
 */

async function resetChanges() {
  console.log(`${running} Reseting last changes ..\n\n`)
  try {
    await exec('git clean -d --force && git reset --hard', {cwd: repoPath})
    console.log(`${done} --Done!\n`)
    return 0
  } catch (error) {
    console.error(`${cross}  --Error when reset`)
    exit(1)
  }
}

/**
 * Pull master
 */

async function pullMaster() {
  console.log(`${running} Pulling master ..`)
  try {
    await exec('git pull', {cwd: repoPath})
    console.log(`${done}  --Done!\n`)
    return 0
  } catch (error) {
    console.error(`${cross}  --Error pulling out master: ${error}`) 
    exit(1)
  }
}

/**
 * Checkout master
 */ 

async function checkoutMaster() {
  console.log(`${running}Checking out master ..`)
  try {
    await exec('git checkout master', {cwd: repoPath})
    console.log(`${done}  --Done!\n`)
    return 0
  } catch (error) {
    console.error(`${cross}  --Error checking out master: ${error}`) 
    exit(1)
  }
}


/**
 * Get Current branch of repo
 */ 

async function getCurrentBranch() {
  const branches = await exec('git branch', {cwd: repoPath})
  const current = branches.stdout.split('\n').find(b => b.charAt(0) === '*')
  return current.toString().substr(2)
}

/**
 * Return current status of repo
 * 0 = Clean
 * 1 = Dirty (need action)
 */ 

async function getCurrentStatus() {
  const statusOutput = await exec('git status', {cwd: repoPath})
  const haveModified = !!statusOutput.stdout.split('\t').toString().match(/modified/g)
  const haveUntracked = !!statusOutput.stdout.split('\t').toString().match(/Untracked/g)
  const haveChanges = haveModified || haveUntracked
  return haveChanges ? 1 : 0
} 
