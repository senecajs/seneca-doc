/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Util = require('util')
var Fs = require('fs')

module.exports = {
  update_file: function(path, injections) {
    var source = Fs.readFileSync(path).toString()
    source = this.update_source(source, injections)
    Fs.writeFileSync(path, source)
  },
  update_source: function(source, injections) {
    Object.keys(injections).forEach(name => {
      var inj = injections[name]
      var re = new RegExp(
        '<!--START:' + name + '-->.*?<!--END:' + name + '-->',
        's'
      )
      source = source.replace(
        re,
        '<!--START:' + name + '-->\n' + inj.text + '\n<!--END:' + name + '-->'
      )
    })
    return source
  }
}

const intern = (module.exports.intern = {})
