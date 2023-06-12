/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Fs = require('fs')

module.exports = {
  update_file: function(path, injections) {
    var source = Fs.readFileSync(path).toString()
    source = this.update_source(source, injections)
    Fs.writeFileSync(path, source)
  },
  update_source: function(source, injections) {
    // console.log('INJS: ', injections)
    Object.values(injections).forEach(inj => {
      inj.forEach(({ name, text }) => {
        var re = new RegExp(
          '<!--START:' + name + '-->.*?<!--END:' + name + '-->',
          's'
        )
        source = source.replace(
          re,
          '<!--START:' + name + '-->\n' + text + '\n<!--END:' + name + '-->'
        )
      })
    })
    return source
  }
}

// const intern = (module.exports.intern = {})
