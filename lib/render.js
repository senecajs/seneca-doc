/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Util = require('util')
var Jsonic = require('seneca').util.Jsonic

module.exports = {
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

      var example_keys = Object.keys(x.examples)
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
            Util.inspect(x.reply_desc, { depth: null, compact: false }) +
            '\n```\n\n'
        )
      }

      b.push('----------')
    })

    return b.join('\n') + '\n\n'
  }
}

const intern = (module.exports.intern = {
  action_params: function(rules) {
    const self = this
    const params = Object.keys(rules)

    if (0 < params.length) {
      const b = ['#### Parameters\n\n']
      params.forEach(function(param) {
        var rule = rules[param]

        var param_md = '* _' + param + '_: '
        if (rule.isJoi) {
          var joidesc = rule.describe()
          b.push(param_md + joidesc.type + self.joiflags(joidesc.flags))
          b.push('  * ' + joidesc.description)
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

  joiflags: function(flags) {
    if (null != flags) {
      var names = Object.keys(flags)
      if (0 < names.length) {
        return ' <i><small>' + Jsonic.stringify(flags) + '</small></i>'
      }
    }

    return ''
  }
})
