'use strict'
const express = require('express')
const httpErrors = require('http-errors')
<%- appType === 'web-app' ? `const path = require('path')\n` : '' -%>
<%- consolidate ? `const consolidate = require('consolidate')\n` : '' -%>
<%- (appType === 'web-app' && !consolidate) ? `const ${viewEngine} = require('${viewEngine}')\n` : '' -%>
<%- bodyParser ? `const bodyParser = require('body-parser')\n` : '' -%>
<%- cookieParser ? `const cookieParser = require('cookie-parser')\n` : '' -%>
<%- serveStatic ? `const serveStatic = require('serve-static')\n` : '' -%>
<%- pino ? `const pino = require('pino')\n` : '' -%>
<%- pino ? `const pinoHttp = require('pino-http')\n` : '' -%>

module.exports = function main (options, cb) {
  // Set default options
  const ready = cb || function () {}
  const opts = Object.assign({
    // Default options
  }, options)

  <%- pino && `const logger = pino()` %>

  // Server state
  let server
  let serverStarted = false
  let serverClosing = false

  // Setup error handling
  function unhandledError (err) {
    // Log the errors
    <%- pino ? `logger.error(err)` : `console.error(err)` %>

    // Only clean up once
    if (serverClosing) {
      return
    }
    serverClosing = true

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1)
      })
    }
  }
  process.on('uncaughtException', unhandledError)
  process.on('unhandledRejection', unhandledError)

  // Create the express app
  const app = express()

  <%_ if (appType === 'web-app') { _%>
  // Template engine
  app.engine('html', <%- consolidate ? `consolidate.${viewEngine}` : `${viewEngine}.renderFile` %>)
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'html')
  <% } -%>

  // Common middleware
  // app.use(/* ... */)
  <%- pino ? `app.use(pinoHttp({ logger }))\n` : '' -%>
  <%- bodyParser ? `app.use(bodyParser.json())
  // app.use(bodyParser.text())
  // app.use(bodyParser.raw())
  // app.use(bodyParser.urlencoded())\n` : '' -%>
  <%- (cookieParser ? `app.use(cookieParser(/* secret */))\n` : '') -%>
  <%- (serveStatic ? `app.use('/public', serveStatic('public'))\n` : '') -%>

  // Register routes
  // @NOTE: require here because this ensures that even syntax errors
  // or other startup related errors are caught logged and debuggable.
  // Alternativly, you could setup external log handling for startup
  // errors and handle them outside the node process.  I find this is
  // better because it works out of the box even in local development.
  require('./routes')(app, opts)

  // Common error handlers
  app.use(function fourOhFourHandler (req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`))
  })
  <%_ if (appType === 'json-api') { _%>
  app.use(function fiveHundredHandler (err, req, res, next) {
    if (err.status >= 500) {
      <%- pino ? `logger.error(err)` : `console.error(err)` %>
    }
    res.status(err.status || 500).json({
      messages: [{
        code: err.code || 'InternalServerError',
        message: err.message
      }]
    })
  })
  <%_ } else if (appType === 'web-app') { _%>
  app.use(function fiveHundredHandler (err, req, res, next) {
    if (err.status >= 500) {
      <%- pino ? `logger.error(err)` : `console.error(err)` %>
    }
    res.locals.name = '<%- name %>'
    res.locals.error = err
    res.status(err.status || 500).render('error')
  })
  <% } -%>

  // Start server
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server)
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error('Server was closed before it could start'))
    }

    serverStarted = true
    const addr = server.address()
    <%- pino ? `logger.info` : `console.log` %>(`Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`)
    ready(err, app, server)
  })
}
