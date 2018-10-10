'use strict'
const path = require('path')
const createPackageJson = require('create-package-json')
const prompt = require('./lib/prompts')
const cptmpl = require('./lib/cptmpl')

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
    name: 'app',
    directory: cwd,
    templatesDir: path.join(__dirname, 'templates'),
    appType: 'JSON API',
    bodyParser: true,
    dependencies: [],
    devDependencies: [],
    main: 'index.js',
    scripts: {
      start: './bin/app',
      prepublishOnly: ''
    }
  }, input)

  // prompt input
  opts = await prompt(opts, input)

  // add to deps
  opts.dependencies.push('express')
  opts.bodyParser && opts.dependencies.push('body-parser')

  if (opts.name !== 'app') {
    opts.scripts.start = './bin/' + opts.name
  }

  await createPackageJson(opts)

  // Write files
  await cptmpl(opts, 'index.js.tmpl', 'index.js')
  await cptmpl(opts, 'routes.js.tmpl', 'routes.js')
  await cptmpl(opts, 'handlers-simple.js.tmpl', 'handlers/simple.js')
  await cptmpl(opts, 'handlers-configured.js.tmpl', 'handlers/configured.js')
  await cptmpl(opts, 'bin-app.tmpl', 'bin/' + opts.name, 0o775)
}
