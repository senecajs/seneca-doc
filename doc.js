/* Copyright (c) 2019-2026 Voxgig Ltd. and other contributors, MIT License */
'use strict'

const Path = require('path')

const Kinds = require('./lib/kinds')

module.exports = doc

module.exports.defaults = {
  // Not read by this plugin; kept for compatibility with older options.
  test: false,

  // True when the seneca-doc command line tool is generating
  // documentation. Exported as `doc/generating`.
  generating: false
}

module.exports.errors = {
  plugin_missing: 'Plugin name missing from message: <%=msg%>',
  pin_missing: 'Pin missing from message: <%=msg%>'
}

// Doc definitions are validated with the Shape builders of Seneca
// (`seneca.valid`). Unknown properties are not allowed.
function make_doc_shapes(valid) {
  return {
    // A doc definition: the messages of a plugin, and optional README
    // sections.
    docdef: valid({
      messages: Object,
      sections: valid.Skip(Object)
    }),

    // Documentation of a single action, keyed by action function name.
    actdoc: valid({
      desc: valid.Skip(String),
      validate: valid.Skip(Object),
      examples: valid.Skip(Object),
      reply_desc: valid.Skip(Object),
      path: valid.Skip(String)
    })
  }
}

// Validate `value` with `shape`; the error message starts with `prefix`.
function attempt(shape, value, prefix) {
  try {
    return shape(value)
  } catch (e) {
    e.message = prefix + ' ' + e.message
    throw e
  }
}

// The utilities passed to a doc definition in function form.
function make_docutil(seneca) {
  const docutil = { valid: seneca.valid }

  // Before 9.0.0 this was a copy of @hapi/joi.
  Object.defineProperty(docutil, 'Joi', {
    get() {
      throw new Error(
        '@seneca/doc no longer provides Joi to doc definitions: ' +
          'describe parameters with valid (the Shape builders of Seneca), ' +
          'or require Joi from your own dependencies.'
      )
    }
  })

  return docutil
}

// Resolve the doc definition of a plugin, in order of preference: the
// `doc` property of the plugin meta data (returned by the definition
// function), the `doc` (or `docdef`) property of the definition function,
// or a `<name>-doc.js` file next to the plugin module.
module.exports.preload = function() {
  const seneca = this
  const shapes = make_doc_shapes(seneca.valid)

  // TODO: replace with ordu task when seneca.add is updated to use ordu
  seneca.private$.action_modifiers.push(function(actdef) {
    var actdoc = {}

    if (
      null != actdef.plugin_fullname &&
      'root$' != actdef.plugin_fullname &&
      'root' != actdef.plugin_fullname &&
      'client$' != actdef.plugin_fullname
    ) {
      let plugin = seneca.find_plugin(actdef.plugin_fullname)

      if (plugin) {
        let docdef

        if (plugin.meta && plugin.meta.doc) {
          docdef = plugin.meta.doc
        }

        // NOTE `doc` is preferred as consistent with meta
        else if (
          plugin.define &&
          (plugin.define.doc || plugin.define.docdef)
        ) {
          docdef = plugin.define.doc || plugin.define.docdef
        }

        var doc_path

        if (null == docdef && null != plugin.requirepath) {
          var doc_path_folder = plugin.requirepath.endsWith('..')
            ? plugin.requirepath
            : Path.dirname(plugin.requirepath)

          if (!Path.isAbsolute(doc_path_folder)) {
            doc_path_folder = doc_path_folder.startsWith('..')
              ? Path.resolve(Path.dirname(plugin.modulepath), doc_path_folder)
              : Path.dirname(plugin.modulepath)
          }

          const doc_path_files = [
            actdef.plugin_name + '-doc.js',
            actdef.plugin_name + 'Doc.js',
            'src/' + actdef.plugin_name + '-doc.js',
            'src/' + actdef.plugin_name + 'Doc.js',
            'dist/' + actdef.plugin_name + '-doc.js',
            'dist/' + actdef.plugin_name + 'Doc.js'
          ]

          let doc_path_file
          for (doc_path_file of doc_path_files) {
            try {
              doc_path = Path.resolve(doc_path_folder, doc_path_file)
              docdef = require(doc_path)
              break
            } catch (e) {
              try {
                doc_path_file = doc_path_file.replace(/_/g, '-')
                doc_path = Path.resolve(doc_path_folder, doc_path_file)
                docdef = require(Path.resolve(doc_path_folder, doc_path_file))
                break
              } catch (e) {
                if ('MODULE_NOT_FOUND' != e.code) {
                  throw e
                }
              }
            }
          }
        }

        if (docdef) {
          // A doc definition may be a function that receives the Seneca
          // instance and utilities (`valid`, the Shape builders of Seneca).
          if ('function' === typeof docdef) {
            docdef = docdef(seneca, make_docutil(seneca))
          }

          docdef = attempt(shapes.docdef, docdef, 'invalid')

          plugin.docdef = docdef
          if (doc_path) {
            plugin.docpath = doc_path
          }
          var actdef_func_name = actdef.func && actdef.func.name
          actdoc = docdef.messages[actdef_func_name]

          if (actdoc) {
            actdoc = attempt(
              shapes.actdoc,
              actdoc,
              'action ' +
                actdef.pattern +
                ' (' +
                actdef_func_name +
                ') documentation invalid'
            )
          } else {
            actdoc = {}
          }
        }
      }
    }

    actdef.desc =
      (actdef.func && actdef.func.desc) ||
      actdoc.desc ||
      'No description provided.'

    actdef.examples =
      (actdef.func && actdef.func.examples) || actdoc.examples || {}
    actdef.reply_desc =
      (actdef.func && actdef.func.reply_desc) || actdoc.reply_desc || null

    actdef.path = actdoc.path || null

    if (actdoc.validate) {
      actdef.rules = actdef.rules || {}
      Object.assign(actdef.rules, actdoc.validate)
    }
  })
}

function doc(options) {
  const seneca = this
  const valid = seneca.valid

  seneca
    .add('sys:doc,describe:plugin', describe_plugin_msg)
    .add('sys:doc,describe:pin', describe_pin)

  // Documentation for this action is defined directly inside the plugin
  Object.assign(describe_plugin_msg, {
    desc: 'Provide introspection data for a plugin and its actions.',
    examples: {
      'plugin:entity': 'Describe the seneca-entity plugin.',
      'plugin:entity$foo':
        'Describe the seneca-entity plugin instance with tag _foo_.'
    },
    // Documentation only: Seneca does not validate with these rules.
    validate: {
      plugin: valid
        .Required(String)
        .Describe(
          'The full name of the plugin (if tagged, use the form name$tag).'
        )
    },
    reply_desc: {
      def: '{ Seneca plugin record }',
      plugin: 'plugin parameter',
      actions: ['{ Seneca action definition }'],
      options_shape: '{ Shape of the plugin options, or null }'
    }
  })

  function describe_plugin_msg(msg, reply) {
    var desc = describe_plugin.call(this, msg)
    reply(desc)
  }

  function describe_plugin(msg) {
    var instance = this || seneca

    if (null == msg.plugin) {
      throw instance.error('plugin_missing', { msg: msg })
    }

    var def = instance.find_plugin(msg.plugin)

    var plugin = msg.plugin.replace(/-/g, '_')
    var names = [msg.plugin, plugin]

    var actions = []
    var list = instance.list()
    list.forEach(function(pat) {
      if ('seneca' == pat.role) return

      var actdef = instance.find(pat)

      if (
        names.includes(actdef.plugin.name) ||
        names.includes(actdef.plugin.fullname)
      ) {
        actions.push(actdef)
      }
    })

    return {
      def: def,
      plugin: plugin,
      actions: actions,
      options_shape: intern.options_shape(instance, def)
    }
  }

  // Documentation for this action is defined in doc-doc.js
  function describe_pin(msg, reply) {
    if (null == msg.pin) {
      throw this.fail('pin_missing', { msg: msg })
    }

    var actions = []
    var list = seneca.list(msg.pin)
    list.forEach(function(pat) {
      var actdef = seneca.find(pat)
      actions.push(actdef)
    })

    reply({
      pin: msg.pin,
      actions: actions
    })
  }

  // Documentation only: Seneca does not validate with these rules.
  describe_pin.validate = {
    pin: valid
      .Required(valid.Any())
      .Describe('The pin sub pattern in string or object format.')
  }

  return {
    exportmap: {
      describe_plugin: describe_plugin,
      generating: options.generating
    }
  }
}

const intern = (module.exports.intern = {
  make_doc_shapes,
  make_docutil,
  attempt,

  // The Shape of a plugin's options, built from the plugin `defaults` as
  // Seneca does when it validates them: a plain object, a shape, or a
  // function of `{ valid }` that returns either. Seneca 4 does not record
  // the shape on the plugin record.
  options_shape: function(instance, def) {
    if (null == def) {
      return null
    }

    const valid = instance.valid
    let defaults = def.defaults

    if ('function' === typeof defaults && !Kinds.is_shape(defaults)) {
      defaults = defaults({ valid })
    }

    if (null == defaults) {
      return null
    }

    if (Kinds.is_shape(defaults)) {
      return defaults
    }

    // Joi schemas are not option shapes; Seneca 4 does not support them.
    if ('object' !== typeof defaults || Kinds.is_joi(defaults)) {
      return null
    }

    try {
      return valid(defaults)
    } catch (e) {
      return null
    }
  }
})
