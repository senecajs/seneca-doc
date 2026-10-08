# Messages reference

The action patterns added by `@seneca/doc`, and its exports. The
replies contain Seneca *action definitions*: the objects returned by
`seneca.find(pattern)`, with the fields listed in
[Doc definition](doc-definition.md#what-is-recorded) added.

## `sys:doc,describe:plugin`

Describe a plugin and its actions.

Parameters:

| Property | Type | Required | Meaning |
| -------- | ---- | -------- | ------- |
| `plugin` | string | yes | The full name of the plugin; for a tagged plugin use `name$tag`. |

Reply:

| Property | Value |
| -------- | ----- |
| `def` | The plugin record from `seneca.find_plugin(plugin)`: `name`, `tag`, `fullname`, `options`, `defaults`, `meta`, `docdef`, `docpath` and so on. `undefined` when no plugin has that name. |
| `plugin` | The requested name with dashes replaced by underscores. |
| `actions` | Array of the action definitions whose plugin `name` or `fullname` equals the requested name (or its underscore form), in the order of `seneca.list()`, excluding patterns with `role:seneca` (plugin init actions). Empty when the plugin is unknown. |
| `options_shape` | The Gubu shape of the plugin options: the shape recorded on the plugin record (`options_shape`, by Seneca 3 when it validates options with Gubu), or otherwise a shape built with `seneca.valid` from `defaults` when they are a plain object, a Gubu shape or a function returning one. `null` for an unknown plugin, for Joi `defaults`, or when there are no `defaults`. |

Errors: `plugin_missing` when `plugin` is absent (see [Errors](errors.md)).

Example:

```js
seneca.act('sys:doc,describe:plugin', { plugin: 'shop' }, function (err, out) {
  // For the tutorial plugin:
  // out.actions[0].pattern === 'cmd:price,role:shop'
  // out.actions[0].desc === 'Calculate the gross price of a quantity of an item.'
})
```

The `validate` property of this action (`plugin: Joi.string().required()`)
documents the parameter; the action itself replies `plugin_missing`
when it is absent.

## `sys:doc,describe:pin`

List the actions matching a pin (a sub pattern).

Parameters:

| Property | Type | Required | Meaning |
| -------- | ---- | -------- | ------- |
| `pin` | string or object | yes | The sub pattern, `'role:shop'` or `{ role: 'shop' }`. |

Reply:

| Property | Value |
| -------- | ----- |
| `pin` | The `pin` parameter as given. |
| `actions` | Array of the action definitions of every pattern returned by `seneca.list(pin)`, from any plugin, including Seneca's own patterns. |

Errors: `pin_missing` when `pin` is absent.

Example:

```js
seneca.act('sys:doc,describe:pin', { pin: 'role:shop' }, function (err, out) {
  // out.actions.map((actdef) => actdef.pattern)
})
```

## Exports

| Export | Value |
| ------ | ----- |
| `seneca.export('doc/describe_plugin')` | Function `(msg) => reply` implementing `describe:plugin` synchronously; `msg.plugin` is required (throws `plugin_missing`). Uses the instance it is called on (`describe.call(seneca, msg)`) or the plugin's instance. |
| `seneca.export('doc/generating')` | The `generating` option: `true` while the `seneca-doc` tool runs, `false` otherwise. |

## Plugin name

The plugin is named `doc`: `seneca.use('@seneca/doc')`,
`seneca.find_plugin('doc')`, `seneca.options().plugin.doc`.
