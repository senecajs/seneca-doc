/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Fs = require('fs')
var Util = require('util')
var Jsonic = require('seneca').util.Jsonic
var Joi = require('@hapi/joi')

module.exports = {
  options: function(plugin) {
    const b = ['\n\n## Options\n']

    var joi_schema = plugin.def.options_schema

    if (
      Joi.isSchema(joi_schema, { legacy: true }) &&
      joi_schema.keys &&
      0 < joi_schema.keys.length
    ) {
      var joidesc = joi_schema.describe()

      intern.walk_options('', b, joidesc)

      b.push('\n\nSet plugin options when loading with:\n```js\n')
      b.push(`
seneca.use('${plugin.def.name}', { name: value, ... })
`)
      b.push('\n```\n')
      b.push(`
<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 
`)
    } else {
      b.push('*None.*')
    }

    return [
      {
        name: 'options',
        text: b.join('\n') + '\n\n'
      }
    ]
  },

  action_list: function(plugin, options) {
    options = options || {}
    var list = (plugin.actions || [])
      .map(a => ({
        pattern: intern.nicepat(a.pattern, options.top)
      }))
      .sort((a, b) => {
        return a.pattern < b.pattern ? -1 : a.pattern > b.pattern ? 1 : 0
      })

    const b = ['\n\n## Action Patterns\n']

    list.forEach(x => {
      b.push('* [' + x.pattern + '](#' + intern.patlink(x.pattern) + ')')
    })

    return [
      {
        name: 'action-list',
        text: b.join('\n') + '\n\n'
      }
    ]
  },

  action_desc: function(plugin, options) {
    options = options || {}
    var list = (plugin.actions || [])
      .map(a => ({
        pattern: intern.nicepat(a.pattern, options.top),
        examples: a.examples,
        rules: a.rules,
        desc: a.desc,
        reply_desc: a.reply_desc,
        path: a.path
      }))
      .sort((a, b) => {
        return a.pattern < b.pattern ? -1 : a.pattern > b.pattern ? 1 : 0
      })

    const b = ['\n\n## Action Descriptions\n']

    list.forEach(x => {
      b.push('### &laquo; `' + x.pattern + '` &raquo;\n')
      if (x.path) {
        var source = Fs.readFileSync(x.path).toString() + '\n'
        b.push(source)
        return [
          {
            name: 'action-desc',
            text: b.join('\n') + '\n\n'
          }
        ]
      }

      b.push((x.desc || '*None.*') + '\n\n')

      var example_keys = Object.keys(x.examples || {})
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

    return [
      {
        name: 'action-desc',
        text: b.join('\n') + '\n\n'
      }
    ]
  },

  sections: function(plugin) {
    let def = plugin.def || {}
    let docdef = def.docdef || {}
    let sections = docdef.sections || {}

    const section_schema = Joi.object({
      path: Joi.string().required()
    })

    let sects = Object.keys(sections).map(name => {
      let section = sections[name]
      let { path } = Joi.attempt(section, section_schema, 'invalid')
      var source = Fs.readFileSync(path).toString()
      return { name: 'SECTION:' + name, text: source }
    })

    return sects
  }
}

const intern = (module.exports.intern = {
  walk_options: function(prefix, b, joidesc) {
    if (joidesc.keys) {
      Object.keys(joidesc.keys).forEach(optname => {
        var optjoi = joidesc.keys[optname]
        intern.walk_options((prefix ? prefix + '.' : '') + optname, b, optjoi)
      })
    } else {
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
        var dval =
          null == flags.default
            ? '&nbsp;'
            : 'function' === typeof flags.default
            ? flags.default()
            : flags.default

        dval =
          'function' === typeof dval
            ? dval.name
            : 'string' === typeof dval
            ? '"' + dval + '"'
            : '' + dval

        return ' <i><small>' + dval + '</small></i>'
      }
    }

    return ''
  },

  // order alpha but top level names (sys,role) go first
  nicepat: function(orig, top) {
    top = top || []
    var pat = Jsonic(orig)
    var names = Object.keys(pat).sort((a, b) => {
      return top.includes(a) && top.includes(b)
        ? a < b
          ? -1
          : b < a
          ? 1
          : 0
        : top.includes(a) && !top.includes(b)
        ? -1
        : !top.includes(a) && top.includes(b)
        ? 1
        : a < b
        ? -1
        : b < a
        ? 1
        : 0
    })

    var out = {}
    names.forEach(n => {
      out[n] = pat[n]
    })
    return JSON.stringify(out).replace(/[{}]/g, '')
  }
})
