/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Fs = require('fs')

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')
const Render = require('../lib/render')
const Inject = require('../lib/inject')

lab.test('validate', PluginValidator(Plugin, module))

lab.test('happy', async () => {
  return await seneca_instance().ready()
})

lab.test('action-validation', async () => {
  var si = await seneca_instance()
    .quiet()
    .use('joi')
    .use('./p0')
    .ready()

  // Load from <name>-doc.js

  var a1o1 = await si.post('p:p0,a:1,x:x')
  expect(a1o1.y).equal('x')

  try {
    await si.post('p:p0,a:1', { x: 1 })
    Code.fail()
  } catch (e) {
    expect(e.message).contains('"x" must be a string')
  }

  var a2o1 = await si.post('p:p0,a:2,x:x')
  expect(a2o1.y).equal('x')

  var a2o2 = await si.post('p:p0,a:2', { x: 1 })
  expect(a2o2.y).equal(1)


  
  // Load from `doc` prop in plugin meta return

  await si.use('./p1').ready()
  // TODO: allow doc extraction from export

  a1o1 = await si.post('p:p1,a:1,x:x')
  expect(a1o1.y).equal('x')

  try {
    await si.post('p:p1,a:1', { x: 1 })
    Code.fail('did not validate')
  } catch (e) {
    expect(e.message).contains('"x" must be a string')
  }

  a2o1 = await si.post('p:p1,a:2,x:x')
  expect(a2o1.y).equal('x')

  a2o2 = await si.post('p:p1,a:2', { x: 1 })
  expect(a2o2.y).equal(1)


  
  // Load from `doc` prop in plugin object

  await si.use('./p2').ready()
  // TODO: allow doc extraction from export

  a1o1 = await si.post('p:p2,a:1,x:x')
  expect(a1o1.y).equal('x')

  try {
    await si.post('p:p2,a:1', { x: 1 })
    Code.fail('did not validate')
  } catch (e) {
    expect(e.message).contains('"x" must be a string')
  }

  a2o1 = await si.post('p:p2,a:2,x:x')
  expect(a2o1.y).equal('x')

  a2o2 = await si.post('p:p2,a:2', { x: 1 })
  expect(a2o2.y).equal(1)

})

lab.test('describe-plugin', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
  expect(out.plugin).equal('doc')
  expect(out.actions[0].pattern).equal('describe:plugin,sys:doc')
})

lab.test('describe-pin', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('sys:doc,describe:pin', { pin: 'role:seneca' })
  expect(out.actions.length).above(0)
})

lab.test('action_list', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
  var md = Render.action_list(out.actions)
  expect(md).contains('describe:plugin,sys:doc')
  expect(md).contains('describe:pin,sys:doc')
})

lab.test('action_desc', async () => {
  var si = await seneca_instance().ready()
  var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
  var md = Render.action_desc(out.actions)
  expect(md).contains('describe:plugin,sys:doc')
})

lab.test('update_source', async () => {
  const src = `
a
<!--START:foo-->
b
<!--END:foo-->
c
<!--START:bar-->
d
<!--END:bar-->
e
`
  var out = Inject.update_source(src, {
    foo: { text: 'BBB' },
    bar: { text: 'DDD' }
  })

  expect(out).equal(`
a
<!--START:foo-->
BBB
<!--END:foo-->
c
<!--START:bar-->
DDD
<!--END:bar-->
e
`)
})

lab.test('update_file', async () => {
  var foo_text = '' + Math.random()
  var bar_text = '' + Math.random()

  Inject.update_file(__dirname + '/test.md', {
    foo: { text: '' + foo_text },
    bar: { text: '' + bar_text }
  })

  var out = Fs.readFileSync(__dirname + '/test.md').toString()
  expect(out.indexOf(foo_text)).above(-1)
  expect(out.indexOf(bar_text)).above(-1)
})

function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
