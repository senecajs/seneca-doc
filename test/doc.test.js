/* Copyright (c) 2019-2023 voxgig and other contributors, MIT License */
'use strict'

const Fs = require('fs')

const Seneca = require('seneca')
const Plugin = require('..')
const Render = require('../lib/render')
const Inject = require('../lib/inject')

describe('doc', () => {
  test('happy', async () => {
    return await makeSeneca().ready()
  })

  test('action-validation', async () => {
    var si = await makeSeneca()
      .quiet()
      .use('joi')
      .use('./p0')
      .ready()

    // Load from <name>-doc.js

    var a1o1 = await si.post('p:p0,a:1,x:x')
    expect(a1o1.y).toEqual('x')

    try {
      await si.post('p:p0,a:1', { x: 1 })
      Code.fail()
    } catch (e) {
      expect(e.message).toContain('"x" must be a string')
    }

    var a2o1 = await si.post('p:p0,a:2,x:x')
    expect(a2o1.y).toEqual('x')

    var a2o2 = await si.post('p:p0,a:2', { x: 1 })
    expect(a2o2.y).toEqual(1)

    // Load from `doc` prop in plugin meta return

    await si.use('./p1').ready()
    // TODO: allow doc extraction from export

    a1o1 = await si.post('p:p1,a:1,x:x')
    expect(a1o1.y).toEqual('x')

    try {
      await si.post('p:p1,a:1', { x: 1 })
      Code.fail('did not validate')
    } catch (e) {
      expect(e.message).toContain('"x" must be a string')
    }

    a2o1 = await si.post('p:p1,a:2,x:x')
    expect(a2o1.y).toEqual('x')

    a2o2 = await si.post('p:p1,a:2', { x: 1 })
    expect(a2o2.y).toEqual(1)

    // Load from `doc` prop in plugin object

    await si.use('./p2').ready()
    // TODO: allow doc extraction from export

    a1o1 = await si.post('p:p2,a:1,x:x')
    expect(a1o1.y).toEqual('x')

    try {
      await si.post('p:p2,a:1', { x: 1 })
      Code.fail('did not validate')
    } catch (e) {
      expect(e.message).toContain('"x" must be a string')
    }

    a2o1 = await si.post('p:p2,a:2,x:x')
    expect(a2o1.y).toEqual('x')

    a2o2 = await si.post('p:p2,a:2', { x: 1 })
    expect(a2o2.y).toEqual(1)
  })

  test('describe-plugin', async () => {
    var si = await makeSeneca().ready()
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    expect(out.plugin).toEqual('doc')
    expect(out.actions[0].pattern).toEqual('describe:plugin,sys:doc')
  })

  test('describe-pin', async () => {
    var si = await makeSeneca().ready()
    var out = await si.post('sys:doc,describe:pin', { pin: 'role:seneca' })
    expect(out.actions.length > 0).toEqual(true)
  })

  test('options_section', async () => {
    var si = await makeSeneca().ready()
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.options(out)
    expect(md[0].text).toContain('## Options')

    // TODO: convert to using Gubu
    // expect(md).toContain('`test`')
  })

  test('action_list', async () => {
    var si = await makeSeneca().ready()
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.action_list(out)[0].text
    expect(md).toContain('describe:plugin,sys:doc')
    expect(md).toContain('describe:pin,sys:doc')
  })

  test('action_desc', async () => {
    var si = await makeSeneca().ready()
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.action_desc(out)[0].text
    expect(md).toContain('describe:plugin,sys:doc')
  })

  test('update_source', async () => {
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
      foo: [{ name: 'foo', text: 'BBB' }],
      bar: [{ name: 'bar', text: 'DDD' }]
    })

    expect(out).toEqual(`
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

  test('update_file', async () => {
    var foo_text = '' + Math.random()
    var bar_text = '' + Math.random()

    Inject.update_file(__dirname + '/test.md', {
      foo: [{ name: 'foo', text: '' + foo_text }],
      bar: [{ name: 'bar', text: '' + bar_text }]
    })

    var out = Fs.readFileSync(__dirname + '/test.md').toString()
    expect(out.indexOf(foo_text) > -1).toEqual(true)
    expect(out.indexOf(bar_text) > -1).toEqual(true)
  })

  test('render-intern-nicepat', async () => {
    var rin = Render.intern.nicepat
    var top = ['sys', 'role']
    expect(rin('a:1,sys:foo', top)).toEqual('sys:foo,a:1')
    expect(rin('b:2,sys:foo,a:1', top)).toEqual('sys:foo,a:1,b:2')
    expect(rin('a:1,role:bar', top)).toEqual('role:bar,a:1')
    expect(rin('b:2,role:bar,a:1', top)).toEqual('role:bar,a:1,b:2')
    expect(rin('sys:foo,a:1,role:bar', top)).toEqual(
      'role:bar,sys:foo,a:1'
    )
    expect(rin('b:2,role:bar,a:1,sys:foo', top)).toEqual(
      'role:bar,sys:foo,a:1,b:2'
    )
  })
})

function makeSeneca(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
