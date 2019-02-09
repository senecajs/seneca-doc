/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

module.exports = seneca_doc
module.exports.errors = {
  plugin_missing: 'Plugin name missing from message: <%=msg%>',
  pin_missing: 'Pin missing from message: <%=msg%>'
}

function seneca_doc(options) {
  const seneca = this

  seneca
    .message('role:doc,describe:plugin', describe_plugin)
    .message('role:doc,describe:pin', describe_pin)

  async function describe_plugin(msg) {
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

    return {
      plugin: plugin,
      actions: actions
    }
  }


  async function describe_pin(msg) {
    if (null == msg.pin) {
      throw this.fail('pin_missing', { msg: msg })
    }

    var actions = []
    var list = seneca.list(msg.pin)
    list.forEach(function(pat) {
      var actdef = seneca.find(pat)
      actions.push(actdef)
    })

    return {
      actions: actions
    }
  }
}
