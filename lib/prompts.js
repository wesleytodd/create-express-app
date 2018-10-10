'use strict'
// vim: set ft=javascript ts=2 sw=2:
const path = require('path')
const inquirer = require('inquirer')

module.exports = async function prompt (opts = {}, options = {}) {
  if (opts.noPrompt === true) {
    return opts
  }

  const answers = await inquirer.prompt([{
    name: 'name',
    message: 'App name:',
    default: opts.name,
    when: !options.name
  }, {
    type: 'list',
    name: 'appType',
    message: 'What type of app is this?',
    choices: ['JSON API', 'HTML Web App', 'Both'],
    default: opts.appType,
    when: typeof options.appType === 'undefined'
  }, {
    name: 'bodyParser',
    message: 'Use Body Parser',
    default: opts.bodyParser,
    when: options.extended && typeof options.bodyParser === 'undefined'
  }])

  // Merge answers into opts
  return Object.assign({}, opts, answers)
}
