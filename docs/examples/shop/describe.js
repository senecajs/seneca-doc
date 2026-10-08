// Tutorial: Documenting a plugin. Query the documentation at runtime.
const Seneca = require('seneca')
const Doc = require('../../..') // in your project: seneca.use('@seneca/doc')

const seneca = Seneca({ log: 'warn' })
  .use(Doc) // load @seneca/doc before the plugins to document
  .use('./shop', { currency: 'USD' })

seneca.ready(async function () {
  try {
    const plugin = await seneca.post('sys:doc,describe:plugin', {
      plugin: 'shop'
    })

    console.log('plugin:', plugin.def.fullname)
    console.log('options:', plugin.def.options.currency, plugin.def.options.tax)
    for (const actdef of plugin.actions) {
      console.log(actdef.pattern + ': ' + actdef.desc)
    }

    const pin = await seneca.post('sys:doc,describe:pin', { pin: 'role:shop' })
    console.log('patterns matching role:shop:', pin.actions.length)
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    // Close on success and on failure so that the process exits.
    await seneca.close()
  }
})
