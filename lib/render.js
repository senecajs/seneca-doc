/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

module.exports = {
  action_list: function (list) {
    list = list.map((x)=>{
      return {text:x.pattern,href:'#'+x.pattern}
    })
                    
    var tm = R.join(
      R.h(2),
      R.each(R.li(R.a()))
    )

    return tm([
      'Action Patterns',
      list
    ])
  },

  action_desc: function (list) {
    list = list.map((x)=>{
      return Object.assign({},x)
    })
                    
    var tm = R.join(
      R.h(2),
      R.each(
        R.join(
          R.h(3,'pattern'),
          R.p('name')
        )
      )
    )

    return tm([
      'Action Descriptions',
      list
    ])
  }

}


const intern = (module.exports.intern = {
  terminal_t: function(c,prop) {
    prop = prop || 'text'
    return ''+(null == c[prop] ? c : c[prop])
  },
  
  join: function() {
    var args = Array.prototype.slice.call(arguments)

    return function(c) {
      var arr = Array.isArray(c)
      var b = []
      for(var i = 0; i < args.length; i++) {
        b.push(args[i]( arr ? c[i] : c ))
      }

      return b.join('')
    }
  },

  h: function(level,prop) {
    level = level || 1
    return function(c) {
      var text = intern.terminal_t(c,prop)
      return '\n\n'+'######'.substring(0,level)+' '+text+'\n\n'
    }
  },

  p: function(prop) {
    return function(c) {
      var text = intern.terminal_t(c,prop)
      return (text.replace(/\n+/g,'\n')+'\n\n').replace(/\n+$/,'\n\n')
    }
  },
  
  a: function(spec) {
    return function(c) {
      return '['+c.text.replace(/\n+/g,'')+']('+c.href+')'
    }
  },

  t: function(spec) {
    return intern.terminal_t
  },
  
  li: function(spec,child) {
    if('function' === typeof(spec)) {
      child = spec
      spec = 1
    }
    return function(c) {
      return '******'.substring(0,spec)+' '+child(c)+'\n'
    }
  },

  each: function(spec,child) {
    if('function' === typeof(spec)) {
      child = spec
      spec = ''
    }
    return function(c) {
      var b = []
      for(var i = 0; i < c.length; i++) {
        b.push(child(c[i]))
      }
      return b.join(spec)
    }
  },

  
})

const R = intern
