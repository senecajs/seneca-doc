/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

module.exports = seneca_doc
module.exports.errors = {
  plugin_missing: 'Plugin name missing from message: <%=msg%>',
  pin_missing: 'Pin missing from message: <%=msg%>'
}


module.exports.preload = function() {
  const seneca = this

  seneca.private$.action_modifiers.push(function(actdef) {
    actdef.desc = (actdef.func && actdef.func.desc) || 'No description provided.'
    actdef.examples = (actdef.func && actdef.func.examples) || {}
    actdef.reply_desc = (actdef.func && actdef.func.reply_desc) || null
  })
}

function seneca_doc(options) {
  const seneca = this
  const Joi = seneca.util.Joi
  
  seneca
    .add('role:doc,describe:plugin', describe_plugin)
    .add('role:doc,describe:pin', describe_pin)


  Object.assign(describe_plugin, {
    desc: 'Provide introspection data for a plugin and its actions.',
    examples: {
      'plugin:entity': 'Describe the seneca-entity plugin.',
      'plugin:entity$foo':
      'Describe the seneca-entity plugin instance with tag _foo_.'
    },
    validate: {
      plugin: Joi.string().required().description(
        'The full name of the plugin (if tagged, use the form name$tag).')
        
    },
    reply_desc: {
      plugin: 'plugin parameter',
      actions: [ '{ Seneca action definition }' ]
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


  Object.assign(describe_pin, {
    desc: 'Provide introspection data for actions matching a _pin_ (a sub pattern).',
    examples: {
      'pin:"a:1,b:2"': 'Describe actions matching at least `a:1,b:2`.',
    },
    validate: {
      pin: Joi.alternatives().try(Joi.string(),Joi.object()).required().description(
        'The pin sub pattern in string or object format.')
        
    },
    reply_desc: {
      pin: 'pin parameter',
      actions: [ '{ Seneca action definition }' ]
    }
  })

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
}
