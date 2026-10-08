/* Copyright (c) 2026 Voxgig Ltd. and other contributors, MIT License */
'use strict'

// Resolve the `seneca` module installed in the project being documented
// (the host project), so that the command line tool and the renderer use
// the same Seneca version as the plugin they inspect. Falls back to the
// copy visible from this package (for example a development checkout).
module.exports = function hostSeneca(folder) {
  const paths = [null == folder ? process.cwd() : folder]

  let seneca_path
  try {
    seneca_path = require.resolve('seneca', { paths })
  } catch (e) {
    seneca_path = require.resolve('seneca')
  }

  return require(seneca_path)
}
