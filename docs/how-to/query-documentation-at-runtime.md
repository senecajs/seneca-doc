# Query documentation at runtime

How to read the documentation collected by `@seneca/doc` from a running
Seneca instance: for a REPL, an admin interface or tests. The message
specification is in the [Messages reference](../reference/messages.md).

## 1. Load `@seneca/doc` first

The plugin records documentation on the actions added after it loads,
so load it before the plugins you want to inspect:

```js
const Seneca = require('seneca')

const seneca = Seneca().use('@seneca/doc').use('./shop')
```

## 2. Describe a plugin

```js
seneca.act('sys:doc,describe:plugin', { plugin: 'shop' }, function (err, out) {
  if (err) {
    console.error(err)
  } else {
    console.log(out.def.fullname, out.def.options)
    out.actions.forEach(function (actdef) {
      console.log(actdef.pattern, actdef.desc, actdef.examples, actdef.reply_desc)
    })
  }

  // Close on both paths so that the process can exit.
  seneca.close()
})
```

`out.def` is the plugin record (`undefined` if no plugin has that
name), `out.actions` the action definitions of the plugin (excluding
Seneca's own `role:seneca` patterns), and `out.options_shape` the Gubu
shape of the plugin options, or `null`. For a tagged plugin pass
`plugin: 'shop$eu'`. The message fails with `plugin_missing` when the
`plugin` property is missing.

With Seneca 4 (or seneca-promisify on Seneca 3) the same query can be
written with promises:

```js
seneca.ready(async function () {
  try {
    const out = await seneca.post('sys:doc,describe:plugin', { plugin: 'shop' })
    out.actions.forEach((actdef) => console.log(actdef.pattern, actdef.desc))
  } finally {
    await seneca.close()
  }
})
```

The complete program of the tutorial,
[docs/examples/shop/describe.js](../examples/shop/describe.js), uses
this form.

## 3. Describe a pin

A pin is a sub pattern; the reply lists every action whose pattern
matches it, from any plugin:

```js
seneca.act('sys:doc,describe:pin', { pin: 'role:shop' }, function (err, out) {
  if (err) console.error(err)
  else out.actions.forEach((actdef) => console.log(actdef.pattern, actdef.desc))
  seneca.close()
})
```

`pin` may be a string (`'role:shop'`) or an object (`{ role: 'shop' }`).
The message fails with `pin_missing` when it is absent.

## 4. Read action definitions directly

Every action added after `@seneca/doc` loaded carries the recorded
documentation:

```js
seneca.ready(function () {
  const actdef = this.find('role:shop,cmd:stock')
  console.log(actdef.desc)       // 'Report the stock level of an item.'
  console.log(actdef.examples)   // {} when none
  console.log(actdef.reply_desc) // null when none
  console.log(actdef.path)       // null unless documented with a file
  console.log(actdef.rules)      // rules, including `validate` from the docs
  this.close()
})
```

## 5. Use the exports

`seneca.export('doc/describe_plugin')` is the function behind
`describe:plugin`, for synchronous use where no message round trip is
wanted:

```js
seneca.ready(function () {
  const describe = this.export('doc/describe_plugin')
  try {
    const out = describe({ plugin: 'shop' })
    console.log(out.actions.length)
  } finally {
    this.close()
  }
})
```

It throws `plugin_missing` when `plugin` is absent.
`seneca.export('doc/generating')` is `true` while the `seneca-doc` tool
runs and `false` otherwise.
