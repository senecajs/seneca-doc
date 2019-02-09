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
const Render = require('../lib/render')
const R = Render.intern

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
  var si = await seneca_instance().ready()
  var out = await si.post('role:doc,describe:plugin', { plugin: 'seneca-doc' })
  expect(out.plugin).equal('seneca_doc')
  expect(out.actions[0].pattern).equal('describe:plugin,role:doc')
})

lab.test('describe-pin', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('role:doc,describe:pin', { pin:'role:seneca' })
  expect(out.actions.length).above(0)
})


lab.test('action_list', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('role:doc,describe:plugin', { plugin: 'seneca-doc' })
  var md = Render.action_list(out.actions)
  console.log(md)
})

lab.test('action_desc', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('role:doc,describe:plugin', { plugin: 'seneca-doc' })
  var md = Render.action_desc(out.actions)
  console.log(md)
})

/*
lab.test('render-hp', async () => {
  expect(R.join(
    R.h(1),
    R.p(),
    R.h(1),
    R.p()
  )([
    'AAA',
    'Lorem ipsum.\n',
    'BBB',
    'Dolor\nsit\n\namet.',
  ])).equal(
    '\n\n# AAA\n\n'+
      'Lorem ipsum.\n\n'+
      '\n\n# BBB\n\n'+
      'Dolor\nsit\namet.\n\n'
  )
})


lab.test('render-h', async () => {
  expect(R.h(1)({text:'aaa'})).equal('\n\n# aaa\n\n')
})

lab.test('render-p', async () => {
  expect(R.p()({text:'aaa'})).equal('aaa\n\n')
})

lab.test('render-a', async () => {
  expect(R.a()({text:'aaa',href:'http://aaa.org'})).equal('[aaa](http://aaa.org)')
})

lab.test('render-t', async () => {
  expect(R.t()({text:'aaa'})).equal('aaa')
})

lab.test('render-li', async () => {
  expect(R.li(1,R.t())({text:'aaa'})).equal('* aaa\n')
})


lab.test('render-each', async () => {
  expect(R.each(' ',R.t())(['a','b'])).equal('a b')
  
  //var list = [{text:'AA',href:'aa.org'},{text:'BB',href:'bb.org'}]
  //expect(R.each('',R.li(1,R.a)),list).equal('')
})
*/


function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
