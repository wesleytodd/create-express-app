'use strict'
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const ejs = require('ejs')

module.exports = function cp (opts, src, dest, mode) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(opts.templatesDir, src), { encoding: 'utf8' }, (err, content) => {
      if (err) return reject(err)

      const rendered = ejs.render(content, opts);

      const destPath = path.join(opts.directory, dest)
      mkdirp(path.dirname(destPath), (err) => {
        if (err) {
          // ignore errors
          console.log(err)
        }

        fs.writeFile(destPath, rendered, {
          mode: mode
        }, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  })
}
