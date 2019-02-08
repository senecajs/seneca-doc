/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')

lab.test(
  'validate',
  Util.promisify(function(x, fin) {
    PluginValidator(Plugin, module)(fin)
  })
)

lab.test('happy', async () => {
  return await seneca_instance().ready()
})

lab.test('describe-plugin', async () => {
  var si =  await seneca_instance().ready()
  var out = await si.post('role:doc,describe:plugin', {plugin:'seneca-doc'})
  console.log(out)
})


function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
