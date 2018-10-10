'use strict'
const path = require('path')
const fs = require('fs')
const createPackageJson = require('create-package-json')
const prompt = require('./lib/prompts')
const cptmpl = require('./lib/cptmpl')

module.exports = async function createExpressApp (input = {}) {
  // We need this for the defaults
  const cwd = process.cwd()

  // Removed undefined values from input and default some options
  const options = Object.keys(input).reduce((o, key) => {
    if (typeof input[key] !== 'undefined') {
      o[key] = input[key]
    }
    return o
  }, {
    extended: false
  })

  // Defaults for 
  let opts = {
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
  }

  // prompt input
  opts = await prompt(opts, options)

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
