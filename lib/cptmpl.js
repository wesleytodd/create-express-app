'use strict'
const path = require('path')
const cptmpl = require('cptmpl')

module.exports = async function cp (opts, src, dest, mode) {
  return cptmpl(path.join(opts.templatesDir, src), path.join(opts.directory, dest), opts, {
    mode: mode
  })
}
