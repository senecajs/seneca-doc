/* Copyright (c) 2019-2023 voxgig and other contributors, MIT License */
'use strict'

const VERBOSE = !!process.env.SENECA_DOC_VERBOSE

const Path = require('path')

const hostSeneca = require('./host-seneca')

// Load the local plugin (package.json `main` of `local_folder`) into a
// Seneca instance of the host project and describe it, without running
// its init action.
module.exports = async function(
  local_folder,
  local_package,
  local_options,
  local_init
) {
  const Seneca = hostSeneca(local_folder)

  const local_plugin_path = Path.resolve(local_folder, local_package.main)

  if (local_options.plugins) {
    local_options.plugins = local_options.plugins.map(p => {
      return Path.resolve(local_folder, 'node_modules', p)
    })
  }

  // TODO: local_options has double role here - fix this - separate into
  // seneca options and doc options!
  let seneca_options = { legacy: false, ...local_options }
  delete seneca_options.top
  if (null == seneca_options.plugins) {
    delete seneca_options.plugins
  }

  var seneca = Seneca(seneca_options).error(function(err) {
    console.log(err)

    // Fail the command. Seneca 4.0.0-rc5 does not terminate the process on
    // fatal errors (such as a plugin that fails to define), so without this
    // the command would exit with code 0 and leave the README unchanged.
    process.exitCode = 1
  })

  if (!VERBOSE) {
    seneca.quiet()
  }

  seneca.use(__dirname + '/../', { generating: true })

  if ('function' === typeof local_init) {
    seneca = local_init(local_folder, local_package, seneca)
  }

  // NOTE: callback form; the promise form of ready() does not resolve on an
  // idle instance in Seneca 4.0.0-rc5, and needs seneca-promisify on Seneca 3.
  await new Promise(resolve => seneca.ready(resolve))

  return new Promise(resolve => {
    var plugin_order = seneca.order.plugin
    var describe_plugin = seneca.export('doc/describe_plugin')

    // Runs after the local plugin has defined its actions (post_meta) and
    // before its init action is called (call_prepare).
    plugin_order.add({
      name: 'seneca_doc_single',
      after: 'post_meta',
      meta: {
        path: local_plugin_path
      },
      exec: function(spec) {
        var path = spec.data.plugin.args[0]
        if (path === local_plugin_path) {
          // Do not run the plugin init action (databases etc. are not
          // needed to document the plugin). The init$ directive is set on
          // the resolved options here, rather than passed to use(), because
          // Seneca 4.0.0-rc option validation rejects it for plugins with
          // defaults.
          spec.data.plugin.options.init$ = false

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

    seneca.use(local_plugin_path)
  })
}
