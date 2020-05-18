/* Copyright (c) 2019 Voxgig Ltd. and other contributors, MIT License */
'use strict'

const Path = require('path')

const Joi = require('@hapi/joi')

module.exports = doc
module.exports.errors = {
  plugin_missing: 'Plugin name missing from message: <%=msg%>',
  pin_missing: 'Pin missing from message: <%=msg%>'
}

const actdoc_schema = Joi.object({
  desc: Joi.string().required(),
  validate: Joi.object(),
  examples: Joi.object(),
  reply_desc: Joi.object()
})

module.exports.preload = function() {
  const seneca = this

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
        else if (plugin.define.doc || plugin.define.docdef) {
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

          var doc_path_file = actdef.plugin_name + '-doc.js'

          try {
            doc_path = Path.resolve(doc_path_folder, doc_path_file)
            docdef = require(doc_path)
          } catch (e) {
            try {
              doc_path_file = doc_path_file.replace(/_/g, '-')
              doc_path = Path.resolve(doc_path_folder, doc_path_file)
              docdef = require(Path.resolve(doc_path_folder, doc_path_file))
            } catch (e) {
              if ('MODULE_NOT_FOUND' != e.code) {
                throw e
              }
            }
          }
        }

        if (docdef) {

          // TODO: document this as it should be prefered way to define Joi schemas
          // in doc definition
          if('function' === typeof(docdef)) {
            docdef = docdef(seneca, {Joi})
          }

          plugin.docdef = docdef
          if (doc_path) {
            plugin.docpath = doc_path
          }
          var actdef_func_name = actdef.func && actdef.func.name
          actdoc = docdef[actdef_func_name]

          if (actdoc) {
            actdoc = Joi.attempt(
              actdoc,
              actdoc_schema,
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

    if (actdoc.validate) {
      actdef.rules = actdef.rules || {}
      Object.assign(actdef.rules, actdoc.validate)
    }
  })
}

function doc(options) {
  const seneca = this
  const Joi = seneca.util.Joi

  seneca
    .add('sys:doc,describe:plugin', describe_plugin)
    .add('sys:doc,describe:pin', describe_pin)

  // Documentation for this action is defined directly inside the plugin
  Object.assign(describe_plugin, {
    desc: 'Provide introspection data for a plugin and its actions.',
    examples: {
      'plugin:entity': 'Describe the seneca-entity plugin.',
      'plugin:entity$foo':
        'Describe the seneca-entity plugin instance with tag _foo_.'
    },
    validate: {
      plugin: Joi.string()
        .required()
        .description(
          'The full name of the plugin (if tagged, use the form name$tag).'
        )
    },
    reply_desc: {
      plugin: 'plugin parameter',
      actions: ['{ Seneca action definition }']
    }
  })

  function describe_plugin(msg, reply) {
    if (null == msg.plugin) {
      throw this.fail('plugin_missing', { msg: msg })
    }

    var plugin = msg.plugin.replace(/-/g, '_')

    var actions = []
    var list = seneca.list()
    list.forEach(function(pat) {
      if ('seneca' == pat.role) return

      var actdef = seneca.find(pat)

      if (actdef.plugin.name == plugin || actdef.plugin.fullname == plugin) {
        actions.push(actdef)
      }
    })

    reply({
      plugin: plugin,
      actions: actions
    })
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

  describe_pin.validate = {
    pin: Joi.alternatives()
      .try(Joi.string(), Joi.object())
      .required()
      .description('The pin sub pattern in string or object format.')
  }

  return {
    exportmap: {
      generating: options.generating
    }
  }
}
