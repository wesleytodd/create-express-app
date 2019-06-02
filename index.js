'use strict'
const path = require('path')
const createPackageJson = require('create-package-json')
const createGit = require('create-git')
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
    pino: true,
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
    },
    git: true
  }, input)

  // prompt input
  opts = await prompt(opts, input)

  // add to deps
  opts.dependencies.push('express', 'http-errors')
  opts.bodyParser && opts.dependencies.push('body-parser')
  opts.consolidate && opts.dependencies.push('consolidate')
  ;((opts.appType === 'web-app') || opts.consolidate) && opts.dependencies.push(opts.viewEngine)
  opts.cookieParser && opts.dependencies.push('cookie-parser')
  opts.serveStatic && opts.dependencies.push('serve-static')
  opts.pino && opts.dependencies.push('pino', 'pino-http', 'pino-pretty')

  // If using pino, use pretty pino for cli output
  ;(opts.pino && (input.scripts && !input.scripts.start)) && (opts.scripts.start = './bin/app | pino-pretty')

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
  const pkg = await createPackageJson({
    noPrompt: opts.noPrompt,
    extended: opts.extended,
    silent: opts.silent,
    directory: opts.directory,
    name: opts.name,
    scope: opts.scope,
    version: opts.version,
    license: opts.license,
    scripts: opts.scripts,
    main: opts.main,
    dependencies: opts.dependencies,
    devDependencies: opts.devDependencies
  })

  if (opts.git) {
    await createGit({
      directory: opts.directory,
      noPrompt: opts.noPrompt,
      silent: opts.silent,
      ignoreTemplates: ['Node.gitignore'],
      remoteOrigin: pkg.repository && pkg.repository.url
    })
  }
}
