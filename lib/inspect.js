/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const VERBOSE = !!process.env.SENECA_DOC_VERBOSE

const Path = require('path')

const Seneca = require('seneca')

module.exports = async function(
  local_folder,
  local_package,
  local_options,
  local_init
) {
  // load .seneca-doc.js from local folder

  const local_plugin_path = Path.resolve(local_folder, local_package.main)

  if (local_options.plugins) {
    local_options.plugins = local_options.plugins.map(p => {
      return Path.resolve(local_folder, 'node_modules', p)
    })
  }

  // TODO: tmp fix for Seneca Gubu
  // local_options has double role here - fix this - separate into seneca options and doc options!
  let seneca_options = { legacy: false, ...local_options }
  delete seneca_options.top

  var seneca = Seneca(seneca_options).error(console.log)

  if (!VERBOSE) {
    seneca.quiet()
  }

  const plugin_options = seneca.options().legacy.options
    ? { generating: true }
    : {}
  seneca.use('promisify').use(__dirname + '/../', plugin_options)

  if ('function' === typeof local_init) {
    seneca = local_init(local_folder, local_package, seneca)
  }

  await seneca.ready()

  return new Promise(resolve => {
    var plugin_order = seneca.order.plugin
    var describe_plugin = seneca.export('doc/describe_plugin')

    plugin_order.add({
      name: 'seneca_doc_single',
      after: 'post_meta',
      meta: {
        path: local_plugin_path
      },
      exec: function(spec) {
        var path = spec.data.plugin.args[0]
        if (path === local_plugin_path) {
          var plugin_desc = describe_plugin({
            plugin: spec.data.plugin.fullname
          })

          // NOTE: need to wait for seneca-doc to complete
          seneca.ready(() => {
            resolve(plugin_desc)
          })
        }
      }
    })

    seneca.use(local_plugin_path, {
      init$: false
      /*
      xdefined$: function(plugin) {
        seneca.act(
          'sys:doc,describe:plugin',
          {
            plugin: plugin.fullname
          },
          (err, plugin_desc) => resolve(plugin_desc)
        )
      }
      */
    })
  })
}
