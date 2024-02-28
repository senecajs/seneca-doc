/* Copyright (c) 2019-2023 voxgig and other contributors, MIT License */
'use strict'

const Fs = require('fs')
const Util = require('util')
const Jsonic = require('seneca').util.Jsonic
const Joi = require('@hapi/joi')

module.exports = {
  options: function(plugin) {
    const b = ['\n\n## Options\n']

    const joi_schema = plugin.def.options_schema
    const options_shape = plugin.def.options_shape

    if (
      Joi.isSchema(joi_schema, { legacy: true }) &&
      joi_schema.keys &&
      0 < joi_schema.keys.length
    ) {
      const joidesc = joi_schema.describe()

      intern.walk_joi_options('', b, joidesc)

      b.push('\n\nSet plugin options when loading with:\n```js\n')
      b.push(`
seneca.use('${plugin.def.name}', { name: value, ... })
`)
      b.push('\n```\n')
      b.push(`
<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 
`)
    } else if (options_shape) {
      intern.walk_gubu_options('', b, options_shape)
    } else {
      b.push('*None.*')
    }

    let out = [
      {
        name: 'options',
        text: b.join('\n') + '\n\n'
      }
    ]

    return out
  },

  action_list: function(plugin, options) {
    options = options || {}
    const list = (plugin.actions || [])
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

    const list = (plugin.actions || [])
      .map(a => ({
        pattern: intern.nicepat(a.pattern, options.top),
        examples: a.examples,
        rules: a.rules,
        gubu: a.gubu,
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
        const source = Fs.readFileSync(x.path).toString() + '\n'
        b.push(source)
        return [
          {
            name: 'action-desc',
            text: b.join('\n') + '\n\n'
          }
        ]
      }

      b.push((x.desc || '*None.*') + '\n\n')

      const example_keys = Object.keys(x.examples || {})
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

      b.push(intern.action_params(x))

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
    const def = plugin.def || {}
    const docdef = def.docdef || {}
    const sections = docdef.sections || {}

    const section_schema = Joi.object({
      path: Joi.string().required()
    })

    const sects = Object.keys(sections).map(name => {
      const section = sections[name]
      const { path } = Joi.attempt(section, section_schema, 'invalid')
      const source = Fs.readFileSync(path).toString()
      return { name: 'SECTION:' + name, text: source }
    })

    return sects
  }
}

const intern = (module.exports.intern = {
  walk_joi_options: function(prefix, b, joidesc) {
    if (joidesc.keys) {
      Object.keys(joidesc.keys).forEach(optname => {
        const optjoi = joidesc.keys[optname]
        intern.walk_options((prefix ? prefix + '.' : '') + optname, b, optjoi)
      })
    } else {
      const opt_md = '* `' + prefix + '` : '
      b.push(opt_md + joidesc.type + intern.joiflags(joidesc.flags))
      if (joidesc.flags && null != joidesc.flags.description) {
        b.push(' : ' + joidesc.flags.description)
      }
    }
  },

  walk_gubu_options: function(prefix, b, shape) {
    let spec = shape?.gubu ? shape.spec() : null
    if (spec && 'object' === spec.t) {
      Object.keys(spec.v).forEach(optname => {
        intern.walk_gubu_options(
          (prefix ? prefix + '.' : '') + optname,
          b,
          spec.v[optname]
        )
      })
    } else {
      const opt_md = '* `' + prefix + '` : '
      b.push(opt_md + shape.t + intern.gubuflags(shape))
      // TODO: meta description
    }
  },
  

  action_params: function(action) {
    const self = this

    const rules = action.gubu ? action.gubu.node().v : action.rules
    
    const params = Object.keys(rules)

    if (0 < params.length) {
      const b = ['#### Parameters\n\n']
      params.forEach(function(param) {
        const rule = rules[param]
        const param_md = '* _' + param + '_ : '

        if (rule.isJoi || Joi.isSchema(rule)) {
          const joidesc = rule.describe()
          b.push(param_md + joidesc.type + self.joiflags(joidesc.flags))
          if (joidesc.flags && null != joidesc.flags.description) {
            b.push(' : ' + joidesc.flags.description)
          }
        }
        else if(rule.$?.gubu$) {
          b.push(param_md + rule.t)
        }
        else {
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
    const flags = Object.assign({}, origflags)
    delete flags.description
    const names = Object.keys(flags)
    if (0 < names.length) {
      let dval =
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

    return ''
  },

  gubuflags: function(shape) {
    if (shape.r) {
      return ' <i><small>required</small></i>'
    }

    return ''
  },

  // order alpha but top level names (sys,role) go first
  nicepat: function(orig, top) {
    top = top || []
    const pat = Jsonic(orig)
    const names = Object.keys(pat).sort((a, b) => {
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

    const out = {}
    names.forEach(n => {
      out[n] = pat[n]
    })
    return JSON.stringify(out).replace(/[{}]/g, '')
  }
})
