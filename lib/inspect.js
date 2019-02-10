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

  const seneca = Seneca(local_options).error(console.log)

  if (!VERBOSE) {
    seneca.quiet()
  }

  seneca.use('promisify').use(__dirname + '/../')

  if ('function' === typeof local_init) {
    seneca = local_init(local_folder, local_package, seneca)
  }

  seneca.use(local_plugin_path)

  // HACK: get most recently loaded plugin
  var plugins = seneca.list_plugins()
  var plugin_name = null
  for (var p in plugins) {
    plugin_name = p
  }
  var plugin = plugins[plugin_name]

  var out = await seneca.post('role:doc,describe:plugin', {
    plugin: plugin.fullname
  })

  return out
}
