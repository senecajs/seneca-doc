/* Copyright (c) 2019-2023 voxgig and other contributors, MIT License */
'use strict'

const Fs = require('fs')
const Os = require('os')
const Path = require('path')

const Seneca = require('seneca')
const Joi = require('@hapi/joi')

const Plugin = require('..')
const Render = require('../lib/render')
const Inject = require('../lib/inject')

describe('doc', () => {
  const instances = []

  afterEach(async () => {
    while (0 < instances.length) {
      const si = instances.pop()
      await new Promise(resolve => si.close(resolve))
    }
  })

  test('happy', async () => {
    await ready(makeSeneca())
  })

  test('describe-plugin', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    expect(out.plugin).toEqual('doc')
    expect(out.def.name).toEqual('doc')
    expect(out.actions[0].pattern).toEqual('describe:plugin,sys:doc')
    expect(out.actions.map(a => a.pattern)).toEqual([
      'describe:plugin,sys:doc',
      'describe:pin,sys:doc'
    ])
    expect(out.actions[0].desc).toEqual(
      'Provide introspection data for a plugin and its actions.'
    )
    expect(Joi.isSchema(out.actions[0].rules.plugin)).toEqual(true)
    expect(typeof out.options_shape).toEqual('function')
  })

  test('describe-plugin-unknown', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'nope' })
    expect(out.plugin).toEqual('nope')
    expect(out.def).toBeUndefined()
    expect(out.actions).toEqual([])
    expect(out.options_shape).toBeNull()
  })

  test('describe-plugin-dashed-name', async () => {
    var si = makeSeneca().use({
      name: 'my-plug',
      define: function() {
        this.add('p:my-plug,a:1', function a1(msg, reply) {
          reply({ ok: true })
        })
      }
    })
    await ready(si)
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'my-plug' })
    expect(out.plugin).toEqual('my_plug')
    expect(out.actions.map(a => a.pattern)).toEqual(['a:1,p:my-plug'])
  })

  test('describe-plugin-missing', async () => {
    var si = await ready(makeSeneca())
    await expect(si.post('sys:doc,describe:plugin')).rejects.toMatchObject({
      code: 'plugin_missing'
    })
  })

  test('describe-pin', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:pin', { pin: 'role:seneca' })
    expect(out.pin).toEqual('role:seneca')
    expect(out.actions.length > 0).toEqual(true)

    out = await si.post('sys:doc,describe:pin', { pin: { sys: 'doc' } })
    expect(out.actions.map(a => a.pattern).sort()).toEqual([
      'describe:pin,sys:doc',
      'describe:plugin,sys:doc'
    ])
  })

  test('describe-pin-missing', async () => {
    var si = await ready(makeSeneca())
    await expect(si.post('sys:doc,describe:pin')).rejects.toMatchObject({
      code: 'pin_missing'
    })
  })

  test('export-generating', async () => {
    var si = await ready(makeSeneca())
    expect(si.export('doc/generating')).toEqual(false)
    expect(typeof si.export('doc/describe_plugin')).toEqual('function')

    var gi = await ready(makeSeneca(null, { generating: true }))
    expect(gi.export('doc/generating')).toEqual(true)
  })

  // Load from <name>-doc.js next to the plugin module.
  test('doc-from-file', async () => {
    var si = makeSeneca().use(Path.join(__dirname, 'p0'))
    await ready(si)

    var a1 = si.find('p:p0,a:1')
    expect(a1.desc).toEqual('a1')
    expect(Joi.isSchema(a1.rules.x)).toEqual(true)
    expect(a1.examples).toEqual({})
    expect(a1.reply_desc).toBeNull()
    expect(a1.path).toBeNull()

    var a2 = si.find('p:p0,a:2')
    expect(a2.desc).toEqual('No description provided.')
    expect(a2.rules).toEqual({})

    var p0 = si.find_plugin('p0')
    expect(p0.docpath).toEqual(Path.join(__dirname, 'p0-doc.js'))
    expect(Object.keys(p0.docdef.messages)).toEqual(['a1'])

    // Rules are documentation; validation needs a validation plugin.
    var out = await si.post('p:p0,a:1', { x: 1 })
    expect(out).toEqual({ y: 1 })
  })

  // Loaded by relative path from a test folder: the doc file is looked up
  // in the resolved folder, so this plugin's own doc-doc.js is found.
  test('doc-from-file-relative', async () => {
    var si = Seneca().test().use('..')
    instances.push(si)
    await ready(si)

    expect(si.find('sys:doc,describe:pin').desc).toEqual(
      'Provide introspection data for actions matching a _pin_ (a sub pattern).'
    )
    expect(si.find_plugin('doc').docpath).toEqual(
      Path.join(__dirname, '..', 'doc-doc.js')
    )
  })

  // seneca-joi, loaded after @seneca/doc, enforces the Joi rules of the docs.
  test('action-validation', async () => {
    var si = makeSeneca()
      .use('seneca-joi')
      .use(Path.join(__dirname, 'p0'))
      .use(Path.join(__dirname, 'p1'))
      .use(Path.join(__dirname, 'p2'))
    await ready(si)

    for (var p of ['p0', 'p1', 'p2']) {
      expect(await si.post('p:' + p + ',a:1,x:x')).toEqual({ y: 'x' })
      await expect(si.post('p:' + p + ',a:1', { x: 1 })).rejects.toMatchObject(
        { code: 'act_invalid_msg' }
      )

      // a2 has no documentation, so no rules
      expect(await si.post('p:' + p + ',a:2', { x: 1 })).toEqual({ y: 1 })
    }
  })

  // Load from `doc` prop in plugin meta return
  test('doc-from-meta', async () => {
    var si = makeSeneca().use(Path.join(__dirname, 'p1'))
    await ready(si)

    var a1 = si.find('p:p1,a:1')
    expect(a1.desc).toEqual('a1')
    expect(Joi.isSchema(a1.rules.x)).toEqual(true)
    expect(si.find('p:p1,a:2').desc).toEqual('No description provided.')
    expect(si.find_plugin('p1').docpath).toBeUndefined()
  })

  // Load from `doc` prop in plugin definition function (function form)
  test('doc-from-define', async () => {
    var si = makeSeneca().use(Path.join(__dirname, 'p2'))
    await ready(si)

    var a1 = si.find('p:p2,a:1')
    expect(a1.desc).toEqual('a1')
    expect(Joi.isSchema(a1.rules.x)).toEqual(true)
    expect(si.find('p:p2,a:2').desc).toEqual('No description provided.')
  })

  // Documentation properties set directly on the action function.
  test('doc-from-function-props', async () => {
    var si = makeSeneca().use(function p3() {
      this.add('p:p3,a:1', a1)
      function a1(msg, reply) {
        reply({ y: msg.x })
      }
      a1.desc = 'direct'
      a1.examples = { 'x:1': 'one' }
      a1.reply_desc = { y: 'x' }
    })
    await ready(si)

    var a1 = si.find('p:p3,a:1')
    expect(a1.desc).toEqual('direct')
    expect(a1.examples).toEqual({ 'x:1': 'one' })
    expect(a1.reply_desc).toEqual({ y: 'x' })
  })

  test('options_section', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.options(out)
    expect(md[0].name).toEqual('options')
    expect(md[0].text).toContain('## Options')
    expect(md[0].text).toContain('* `test` : boolean <i><small>false</small></i>')
    expect(md[0].text).toContain(
      '* `generating` : boolean <i><small>false</small></i>'
    )
    expect(md[0].text).not.toContain('errors')
  })

  test('options_section_nested', async () => {
    var Gubu = Seneca.util.Gubu
    var shape = Gubu({
      currency: 'EUR',
      tax: { rate: 0.2 },
      name: Gubu.Required(String),
      note: Gubu.Skip(String),
      handler: () => null,
      init$: true
    })
    var md = Render.options({ def: {}, options_shape: shape })[0].text
    expect(md).toContain('* `currency` : string <i><small>"EUR"</small></i>')
    expect(md).toContain('* `tax.rate` : number <i><small>0.2</small></i>')
    expect(md).toContain('* `name` : string <i><small>required</small></i>')
    expect(md).toContain('* `note` : string\n')
    expect(md).toContain('* `handler` : function\n')
    expect(md).not.toContain('init$')

    expect(Render.options({ def: {} })[0].text).toContain('*None.*')
  })

  // Options shape: recorded by Seneca 3, built from the defaults otherwise.
  test('options_shape', async () => {
    var si = await ready(makeSeneca())
    var options_shape = Plugin.intern.options_shape

    expect(options_shape(si, undefined)).toBeNull()
    expect(options_shape(si, {})).toBeNull()
    expect(
      options_shape(si, { defaults: Joi.object({ a: Joi.string() }) })
    ).toBeNull()

    var recorded = Seneca.util.Gubu({ r: 0 })
    expect(options_shape(si, { options_shape: recorded })).toBe(recorded)

    var given = Seneca.util.Gubu({ b: 2 })
    expect(options_shape(si, { defaults: given })).toBe(given)

    expect(options_shape(si, { defaults: { a: 1 } })({})).toEqual({ a: 1 })
    expect(
      options_shape(si, { defaults: ({ valid }) => valid({ c: 3 }) })({})
    ).toEqual({ c: 3 })
  })

  // A Joi schema recorded as options_schema is rendered instead of a shape.
  test('options_section_joi', async () => {
    var md = Render.options({
      def: {
        name: 'foo',
        options_schema: Joi.object({
          a: Joi.string()
            .default('x')
            .description('The a option.'),
          b: Joi.object({ c: Joi.number().required() })
        })
      }
    })[0].text
    expect(md).toContain('* `a` : string <i><small>"x"</small></i>\n : The a option.')
    expect(md).toContain('* `b.c` : number <i><small>required</small></i>')
    expect(md).toContain("seneca.use('foo', { name: value, ... })")
  })

  test('action_list', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.action_list(out)[0].text
    expect(md).toContain('## Action Patterns')
    expect(md).toContain(
      '* [describe:pin,sys:doc](#-describepinsysdoc-)'
    )
    expect(md).toContain('describe:plugin,sys:doc')

    md = Render.action_list(out, { top: ['sys'] })[0].text
    expect(md).toContain('* [sys:doc,describe:pin](#-sysdocdescribepin-)')
  })

  test('action_desc', async () => {
    var si = await ready(makeSeneca())
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'doc' })
    var md = Render.action_desc(out, { top: ['sys'] })[0].text
    expect(md).toContain('## Action Descriptions')
    expect(md).toContain('### &laquo; `sys:doc,describe:plugin` &raquo;')
    expect(md).toContain(
      'Provide introspection data for a plugin and its actions.'
    )
    expect(md).toContain('* `sys:doc,describe:plugin,plugin:entity`')
    expect(md).toContain('* __plugin__ : string <i><small>required</small></i>')
    expect(md).toContain('#### Replies With')
    expect(md).toContain("plugin: 'plugin parameter'")
  })

  test('action_desc_gubu_rules', async () => {
    var si = makeSeneca().use(function p4() {
      // Scalars in a pattern are matching values; rules need a type or builder.
      this.add(
        'p:p4,a:1',
        { x: String, y: Seneca.util.Gubu.Default(1) },
        function a1(msg, reply) {
          reply({ y: msg.x })
        }
      )
    })
    await ready(si)
    var out = await si.post('sys:doc,describe:plugin', { plugin: 'p4' })
    var md = Render.action_desc(out)[0].text
    expect(md).toContain('* __x__ : _string_')
    expect(md).toContain('* __y__ : _number_ (optional, default: `1`)')
  })

  test('action_desc_path', async () => {
    var dir = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'seneca-doc-'))
    var path = Path.join(dir, 'a1.md')
    Fs.writeFileSync(path, 'From a file.')
    var md = Render.action_desc({
      actions: [{ pattern: 'a:1', desc: 'ignored', path: path }]
    })[0].text
    expect(md).toContain('### &laquo; `a:1` &raquo;')
    expect(md).toContain('From a file.')
    expect(md).not.toContain('ignored')
  })

  test('sections', async () => {
    var dir = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'seneca-doc-'))
    var path = Path.join(dir, 'usage.md')
    Fs.writeFileSync(path, 'Usage text.')
    var out = Render.sections({
      def: { docdef: { sections: { usage: { path: path } } } }
    })
    expect(out).toEqual([{ name: 'SECTION:usage', text: 'Usage text.' }])

    expect(Render.sections({})).toEqual([])
    expect(() =>
      Render.sections({ def: { docdef: { sections: { bad: {} } } } })
    ).toThrow(/invalid/)
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

    // Text with $ is inserted literally; unknown markers are left alone.
    out = Inject.update_source(src, {
      foo: [{ name: 'foo', text: 'cost $1' }],
      zed: [{ name: 'zed', text: 'ZZZ' }]
    })
    expect(out).toContain('<!--START:foo-->\ncost $1\n<!--END:foo-->')
    expect(out).not.toContain('ZZZ')
  })

  test('update_file', async () => {
    var dir = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'seneca-doc-'))
    var path = Path.join(dir, 'test.md')
    Fs.copyFileSync(Path.join(__dirname, 'test.md'), path)

    var foo_text = '' + Math.random()
    var bar_text = '' + Math.random()

    Inject.update_file(path, {
      foo: [{ name: 'foo', text: '' + foo_text }],
      bar: [{ name: 'bar', text: '' + bar_text }]
    })

    var out = Fs.readFileSync(path).toString()
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
    expect(rin('sys:foo,a:1,role:bar', top)).toEqual('role:bar,sys:foo,a:1')
    expect(rin('b:2,role:bar,a:1,sys:foo', top)).toEqual(
      'role:bar,sys:foo,a:1,b:2'
    )
    expect(rin('b:2,a:1')).toEqual('a:1,b:2')
  })

  function makeSeneca(config, plugin_options) {
    const si = Seneca(config)
      .test()
      .use(Plugin, plugin_options)
    instances.push(si)
    return si
  }

  // Callback form: the promise form of ready() does not resolve on an idle
  // instance in Seneca 4.0.0-rc5.
  function ready(si) {
    return new Promise(resolve => si.ready(() => resolve(si)))
  }
})
