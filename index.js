'use strict'
const path = require('path')
const createPackageJson = require('create-package-json')
const prompt = require('./lib/prompts')
const cptmpl = require('cptmpl')

module.exports = async function createExpressApp (options = {}) {
  // We need this for the defaults
  const cwd = process.cwd()

  // Removed undefined input values
  const input = Object.keys(options).reduce((o, key) => {
    if (typeof options[key] !== 'undefined') {
      o[key] = options[key]
    }
    return o
  }, {})

  // Defaults
  let opts = Object.assign({
    noPrompt: false,
    extended: false,
    silent: false,
    force: false,
    name: path.basename(input.directory || cwd),
    directory: cwd,
    appType: 'bare',
    bodyParser: false,
    consolidate: false,
    cookieParser: false,
    dependencies: [],
    devDependencies: [],
    main: 'index.js',
    scripts: {
      start: '',
      prepublishOnly: '',
      prepare: '',
      postpublish: '',
      preversion: ''
    }
  }, input)

  // prompt input
  opts = await prompt(opts, input)

  // add to deps
  opts.dependencies.push('express')
  opts.dependencies.push('http-errors')
  opts.bodyParser && opts.dependencies.push('body-parser')
  opts.consolidate && opts.dependencies.push('consolidate')
  ;((opts.appType === 'web-app') || opts.consolidate) && opts.dependencies.push('ejs')
  opts.cookieParser && opts.dependencies.push('cookie-parser')

  // start script
  opts.scripts.start = opts.scripts.start || './bin/' + opts.name

  // Copy templates
  switch (opts.appType) {
    case 'bare':
    case 'json-api':
    case 'web-app':
      opts.template = opts.template || path.join(__dirname, 'templates', opts.appType)
      break
    default:
      opts.template = opts.template || path.join(__dirname, 'templates', 'bare')
  }
  await cptmpl.recursive(opts.template, opts.directory, opts, {
    force: opts.force,
    processTemplateFilenames: opts.processTemplateFilenames
  })

  // create the package json
  await createPackageJson({
    name: opts.name,
    scope: opts.scope,
    noPrompt: opts.noPrompt,
    extended: opts.extended,
    silent: opts.silent,
    directory: opts.directory,
    scripts: opts.scripts,
    main: opts.main,
    dependencies: opts.dependencies,
    devDependencies: opts.devDependencies
  })
}
