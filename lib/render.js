/* Copyright (c) 2019-2026 voxgig and other contributors, MIT License */
'use strict'

const Fs = require('fs')
const Util = require('util')

const HostSeneca = require('./host-seneca')()
const Kinds = require('./kinds')

const Jsonic = HostSeneca.util.Jsonic

module.exports = {
  options: function(plugin) {
    const b = ['\n\n## Options\n']

    const options_shape = plugin.options_shape

    if (options_shape) {
      intern.walk_shape_options('', b, options_shape)
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
        shape: a.shape,
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

      // A documentation file replaces the generated description.
      if (x.path) {
        const source = Fs.readFileSync(x.path).toString() + '\n'
        b.push(source)
        b.push('----------')
        return
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

    const section_shape = HostSeneca.valid({
      path: String
    })

    const sects = Object.keys(sections).map(name => {
      const section = sections[name]
      let path
      try {
        path = section_shape(section).path
      } catch (e) {
        e.message = 'invalid ' + e.message
        throw e
      }
      const source = Fs.readFileSync(path).toString()
      return { name: 'SECTION:' + name, text: source }
    })

    return sects
  }
}

const intern = (module.exports.intern = {
  // `shape` is a Shape at the top level, and a node of its spec() below.
  walk_shape_options: function(prefix, b, shape) {
    const spec = Kinds.is_shape(shape) ? shape.spec() : shape

    if (spec && 'object' === spec.t && spec.v && 'object' === typeof spec.v) {
      Object.keys(spec.v).forEach(optname => {
        // Directives (init$ etc.) are not options.
        if (optname.endsWith('$')) {
          return
        }

        intern.walk_shape_options(
          (prefix ? prefix + '.' : '') + optname,
          b,
          spec.v[optname]
        )
      })
    } else if (spec) {
      const opt_md = '* `' + prefix + '` : '
      b.push(opt_md + spec.t + intern.shapeflags(spec))
      if (spec.m && null != spec.m.description) {
        b.push(' : ' + spec.m.description)
      }
    }
  },

  action_params: function(action) {
    const self = this

    // The rules of the pattern, compiled by Seneca, or else the rules of the
    // `validate` annotation.
    const rules =
      (Kinds.is_shape(action.shape) ? action.shape.node().v : action.rules) ||
      {}

    const params = Object.keys(rules)

    if (0 < params.length) {
      const b = ['\n#### Parameters\n\n']
      params.forEach(function(param) {
        const rule = rules[param]
        const param_md = '* __' + param + '__ : '

        if (Kinds.is_joi(rule)) {
          const joidesc = rule.describe()
          b.push(param_md + joidesc.type + self.joiflags(joidesc.flags))
          if (joidesc.flags && null != joidesc.flags.description) {
            b.push(' : ' + joidesc.flags.description)
          }
        } else if (Kinds.is_shape_node(rule)) {
          b.push(
            param_md +
              '_' +
              rule.t +
              '_' +
              (rule.r
                ? ''
                : ' (optional, default: `' +
                  String(JSON.stringify(rule.v)).replaceAll(/"/g, '') +
                  '`)') +
              (rule.m && null != rule.m.description
                ? ' : ' + rule.m.description
                : '')
          )
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

  // Required flag, or the default value, of a Joi description.
  joiflags: function(origflags) {
    const flags = Object.assign({}, origflags)

    if ('required' === flags.presence) {
      return ' <i><small>required</small></i>'
    }

    if (null != flags.default) {
      let dval =
        'function' === typeof flags.default
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

  // Required flag, or the default value, of a Shape spec node. Only string,
  // number and boolean defaults are shown; optional values (Skip) have none.
  shapeflags: function(spec) {
    if (spec.r) {
      return ' <i><small>required</small></i>'
    }

    if (
      !spec.p &&
      ['string', 'number', 'boolean'].includes(spec.t) &&
      spec.t === typeof spec.v
    ) {
      return ' <i><small>' + JSON.stringify(spec.v) + '</small></i>'
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
    return JSON.stringify(out).replace(/[{}"]/g, '')
  }
})
