'use strict'
const path = require('path')
const createPackageJson = require('create-package-json')
const prompt = require('./lib/prompts')
const cptmpl = require('cptmpl')
const fs = require('fs-extra')

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
    serveStatic: false,
    viewEngine: 'ejs',
    dependencies: [],
    devDependencies: [],
    main: 'index.js',
    scripts: {
      start: './bin/app',
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
  ;((opts.appType === 'web-app') || opts.consolidate) && opts.dependencies.push(opts.viewEngine)
  opts.cookieParser && opts.dependencies.push('cookie-parser')
  opts.serveStatic && opts.dependencies.push('serve-static')

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

  // Copy web app templates
  if (opts.appType === 'web-app') {
    switch (opts.viewEngine) {
      case 'ejs':
      case 'pug':
        await cptmpl.recursive(path.join(__dirname, 'templates', 'views', opts.viewEngine), path.join(opts.directory, 'views'), opts, {
          force: opts.force,
          processTemplateFilenames: opts.processTemplateFilenames
        })
        break
    }
  }

  if (opts.serveStatic) {
    await fs.ensureDir(path.join(opts.directory, 'public'))
    await fs.copy(path.join(__dirname, 'templates', 'express-favicon.png'), path.join(opts.directory, 'public', 'favicon.png'), {
      overwrite: opts.force
    })
  }

  // create the package json
  await createPackageJson({
    name: opts.name,
    scope: opts.scope,
    version: opts.version,
    license: opts.license,
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
