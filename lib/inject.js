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
    Object.values(injections).forEach(inj => {
      inj.forEach(({ name, text }) => {
        var re = new RegExp(
          '<!--START:' + name + '-->.*?<!--END:' + name + '-->',
          's'
        )

        let html =
          '<!--START:' +
          name +
          '-->\n' +
          text.replace(/\$/g, '$$$$') +
          '\n<!--END:' +
          name +
          '-->'

        source = source.replace(re, html)
      })
    })
    return source
  }
}

// const intern = (module.exports.intern = {})
