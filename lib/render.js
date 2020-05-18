/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Util = require('util')
//var Jsonic = require('seneca').util.Jsonic
var Joi = require('@hapi/joi')

module.exports = {
  options: function(plugin) {
    const b = ['\n\n## Options\n']

    var joi_schema = plugin.def.options_schema
    
    if(Joi.isSchema(joi_schema,{legacy:true})) {
      var joidesc = joi_schema.describe()
      //console.dir(joidesc, {depth:null})

      intern.walk_options('', b, joidesc)
    }

    // TODO: code example
    // TODO: note re dot notation
    
    return b.join('\n') + '\n\n'
  },

  action_list: function(list) {
    const b = ['\n\n## Action Patterns\n']

    list.forEach(x => {
      b.push('* [' + x.pattern + '](#' + intern.patlink(x.pattern) + ')')
    })

    return b.join('\n') + '\n\n'
  },

  action_desc: function(list) {
    const b = ['\n\n## Action Descriptions\n']

    list.forEach(x => {
      b.push('### &laquo; `' + x.pattern + '` &raquo;\n')
      b.push(x.desc + '\n\n')

      var example_keys = Object.keys(x.examples||{})
      if (0 < example_keys.length) {
        b.push('\n\n#### Examples\n\n')
        example_keys.forEach(patpart => {
          b.push(
            '\n* `' +
              x.pattern +
              ',' +
              patpart +
              '`\n  * ' +
              x.examples[patpart]
          )
        })
      }

      b.push(intern.action_params(x.rules))

      if (x.reply_desc) {
        b.push('\n\n#### Replies With\n\n')
        b.push(
          '```\n' +
            Util.inspect(x.reply_desc, {
              depth: null,
              compact: false,
              breakLength: Infinity
            }) +
            '\n```\n\n'
        )
      }

      b.push('----------')
    })

    return b.join('\n') + '\n\n'
  }
}

const intern = (module.exports.intern = {
  walk_options: function(prefix, b, joidesc) {
    if(joidesc.keys) {
      Object.keys(joidesc.keys).forEach(optname=>{
        var optjoi = joidesc.keys[optname]
        intern.walk_options((prefix?prefix+'.':'')+optname, b, optjoi)
      })
    }
    else {
      var opt_md = '* `' + prefix + '` : '
      b.push(opt_md + joidesc.type + intern.joiflags(joidesc.flags))
      if (joidesc.flags && null != joidesc.flags.description) {
        b.push(' : ' + joidesc.flags.description)
      }
    }
  },

  action_params: function(rules) {
    const self = this
    const params = Object.keys(rules)

    if (0 < params.length) {
      const b = ['#### Parameters\n\n']
      params.forEach(function(param) {
        var rule = rules[param]

        var param_md = '* _' + param + '_ : '
        if (rule.isJoi || Joi.isSchema(rule)) {
          var joidesc = rule.describe()
          b.push(param_md + joidesc.type + self.joiflags(joidesc.flags))
          if (joidesc.flags && null != joidesc.flags.description) {
            b.push(' : ' + joidesc.flags.description)
          }
        } else {
          b.push(param_md + Util.inspect(rule))
        }
      })
      return b.join('\n') + '\n\n'
    }

    return ''
  },

  patlink: function(pat) {
    return '-' + pat.replace(/[^\w]/g, '') + '-'
  },

  joiflags: function(origflags) {
    var flags = Object.assign({}, origflags)
    delete flags.description
    if (null != flags) {
      var names = Object.keys(flags)
      if (0 < names.length) {
        var dval = null == flags.default ? '&nbsp;' :
            ('function'===typeof(flags.default)?flags.default():flags.default)

        dval = 'function'===typeof(dval)?dval.name:
          'string'===typeof(dval)?'"'+dval+'"':
          ''+dval
        
        return ' <i><small>' + dval + '</small></i>'
      }
    }

    return ''
  }
})
