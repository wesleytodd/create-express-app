'use strict'
// vim: set ft=javascript ts=2 sw=2:
const inquirer = require('inquirer')

module.exports = async function prompt (opts = {}, input = {}) {
  if (opts.noPrompt === true) {
    return opts
  }

  const answers1 = await inquirer.prompt([{
    name: 'name',
    message: 'App name:',
    default: opts.name,
    when: !input.name
  }, {
    type: 'list',
    name: 'appType',
    message: 'What type of app do you want to scaffold?',
    choices: [{
      name: 'Bare Bones',
      value: 'bare'
    }, {
      name: 'JSON API',
      value: 'json-api'
    }, {
      name: 'Web App',
      value: 'web-app'
    }],
    default: opts.appType,
    when: typeof input.appType === 'undefined'
  }])

  const answers2 = await inquirer.prompt([{
    type: 'list',
    name: 'viewEngine',
    message: 'View Engine',
    choices: [{
      name: 'ejs',
      value: 'ejs'
    }, {
      name: 'pug',
      value: 'pug'
    }],
    default: opts.viewEngine,
    when: typeof input.viewEngine === 'undefined' && answers1.appType === 'web-app'
  }, {
    type: 'confirm',
    name: 'consolidate',
    message: 'Use consolidate',
    default: opts.consolidate || answers1.appType === 'web-app',
    when: opts.extended && typeof input.consolidate === 'undefined' && answers1.appType === 'web-app'
  }, {
    type: 'confirm',
    name: 'bodyParser',
    message: 'Use body-parser',
    default: opts.bodyParser || answers1.appType === 'json-api',
    when: opts.extended && typeof input.bodyParser === 'undefined'
  }, {
    type: 'confirm',
    name: 'cookieParser',
    message: 'Use cookie-parser',
    default: opts.cookieParser,
    when: opts.extended && typeof input.cookieParser === 'undefined'
  }, {
    type: 'confirm',
    name: 'serveStatic',
    message: 'Use serve-static',
    default: opts.serveStatic,
    when: opts.extended && typeof input.serveStatic === 'undefined'
  }, {
    type: 'confirm',
    name: 'pino',
    message: 'Use pino',
    default: opts.pino,
    when: opts.extended && typeof input.pino === 'undefined'
  }, {
    type: 'confirm',
    name: 'git',
    message: 'Use git',
    default: opts.git,
    when: opts.extended && typeof input.git === 'undefined'
  }])

  // Merge answers into opts
  return Object.assign({}, opts, answers1, answers2)
}
