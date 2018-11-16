'use strict'

module.exports = function (opts) {
  return function (req, res) {
    res.json({
      opts: opts
    })
  }
}
