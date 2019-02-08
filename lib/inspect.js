/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const VERBOSE = !!process.env.SENECA_DOC_VERBOSE

const Path = require('path')

const Seneca = require('seneca')

module.exports = function(local_folder, local_package, local_init) {
  // load .seneca-doc.js from local folder

  const local_plugin_path = Path.resolve(local_folder, local_package.main)

  const seneca = Seneca()

  if (!VERBOSE) {
    seneca.quiet()
  }

  seneca.use('promisify')

  if ('function' === typeof local_init) {
    seneca = local_init(local_folder, local_package, seneca)
  } else {
    seneca.use(local_plugin_path)
  }

  const out = {}
  out.patterns = seneca.list()

  return out
}
