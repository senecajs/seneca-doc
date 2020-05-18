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

  var seneca = Seneca(local_options).error(console.log)

  if (!VERBOSE) {
    seneca.quiet()
  }

  seneca.use('promisify').use(__dirname + '/../', { generating: true })

  if ('function' === typeof local_init) {
    seneca = local_init(local_folder, local_package, seneca)
  }

  await seneca.ready()
  
  return new Promise(resolve => {

    var plugin_order = seneca.order.plugin
    var describe_plugin = seneca.export('doc/describe_plugin')
    //console.log('DESCP',describe_plugin)
    
    plugin_order.add({
      name: 'seneca_doc_single',
      after: 'post_meta',
      meta: {
        path: local_plugin_path
      },
      exec: function(spec) {
        var path = spec.data.plugin.args[0]
        if(path === local_plugin_path) {
          //var options_schema = spec.data.plugin.options_schema ||
          //    Seneca.util.Joi.object()
          //console.log('SD-TASK', local_plugin_path, options_schema.describe())
          var plugin_desc = describe_plugin({plugin:spec.data.plugin.fullname})
          //console.log('SD-TASK DESCP', plugin_desc)
          resolve(plugin_desc)
        }
      }
    })
    

    seneca.use(local_plugin_path, {
      init$: false,
      xdefined$: function(plugin) {
        /*
        // HACK: get most recently loaded plugin
        var plugins = seneca.list_plugins()
        var plugin_name = null
        for (var p in plugins) {
          plugin_name = p
        }
        var plugin = plugins[plugin_name]
        */

        seneca.act(
          'sys:doc,describe:plugin',
          {
            plugin: plugin.fullname
          },
          (err, plugin_desc) => resolve(plugin_desc)
        )
      }
    })
  })
}
