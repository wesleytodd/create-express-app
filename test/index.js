'use strict'
const path = require('path')
const assert = require('assert')
const { describe, it, beforeEach } = require('mocha')
const fs = require('fs-extra')
const createExpressApp = require('../')
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')

describe('create-express-app', function () {
  beforeEach(() => fs.remove(TMP_DIR))

  it('should create a basic express app', async function () {
    this.timeout(60 * 1000)

    await createExpressApp({
      directory: TMP_DIR,
      noPrompt: true,
      silent: true,
      name: 'test-app',
      description: 'A test package',
      repository: 'git@github.com:wesleytodd/create-express-app.git'
    })

    // Ensure the right files are created
    assert(fs.pathExists(path.join(TMP_DIR, 'index.js')))
    assert(fs.pathExists(path.join(TMP_DIR, 'routes.js')))
    assert(fs.pathExists(path.join(TMP_DIR, 'package.json')))
    assert(fs.pathExists(path.join(TMP_DIR, 'package-lock.json')))
    assert(fs.pathExists(path.join(TMP_DIR, 'node_modules')))
    assert(fs.pathExists(path.join(TMP_DIR, 'bin', 'test-app')))
    assert(fs.pathExists(path.join(TMP_DIR, 'handlers', 'simple.js')))
    assert(fs.pathExists(path.join(TMP_DIR, 'handlers', 'configured.js')))

    // Ensure the server starts
    await new Promise((resolve) => {
      assert.doesNotThrow(() => {
        require(path.join(TMP_DIR))({
          port: null
        }, (err, app, server) => {
          assert(!err)
          assert(app)
          assert(server)
          assert(server.address().port)
          server.close(() => {
            resolve()
          })
        })
      })
    })
  })
})
