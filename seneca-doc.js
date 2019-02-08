/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

module.exports = seneca_doc
module.exports.errors = {
  plugin_missing: 'Plugin name missing from message: <%=msg%>'
}

function seneca_doc(options) {
  const seneca = this

  seneca.message('role:doc,describe:plugin', describe_plugin)

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
}
