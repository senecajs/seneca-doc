# Define the documentation inside the plugin

How to make a plugin carry its own documentation, so that it is
available at runtime however the plugin is loaded, including by module
name (`seneca.use('seneca-shop')`), where a separate
[doc file](write-a-doc-file.md) is not found.

`@seneca/doc` looks for a doc definition in this order, and uses the
first one found:

1. the `doc` property of the meta data object returned by the plugin
   definition function (`meta.doc`),
2. the `doc` (or `docdef`) property of the plugin definition function,
3. a `-doc.js` file next to the plugin module.

## Return it from the definition function

```js
module.exports = function shop(options) {
  this.add('role:shop,cmd:price', function price(msg, reply) { ... })

  return {
    doc: require('./shop-doc')
  }
}
```

The value is a doc definition: an object with `messages` (and
optionally `sections`), or a function `(seneca, { Joi }) => definition`.
Other meta data properties (`exports`, `name` and so on) can be returned
alongside `doc`.

## Set it on the definition function

```js
module.exports = shop

module.exports.doc = require('./shop-doc')

function shop(options) {
  this.add('role:shop,cmd:price', function price(msg, reply) { ... })
}
```

`docdef` is accepted as an alias of `doc`. This form works for plugins
written as functions and for module plugins whose export is the
definition function.

## Put properties on the action function

The documentation of a single action can also be set directly on its
function. These properties take precedence over the doc definition:

```js
seneca.add('role:shop,cmd:price', price)

function price(msg, reply) { ... }

price.desc = 'Calculate the gross price of a quantity of an item.'
price.examples = { 'item:apple,quantity:2': 'Price of two apples.' }
price.reply_desc = { price: 'gross price', currency: 'currency code' }
price.validate = { item: Joi.string().required() }
```

`desc`, `examples` and `reply_desc` are read by `@seneca/doc`.
`validate` is read by Seneca itself (both 3 and 4), which merges it into
the action's rules; `@seneca/doc` then renders those rules. The
`@seneca/doc` plugin documents its own `describe:plugin` action this
way, see [doc.js](../../doc.js).

Properties can be set after the `seneca.add` call because action
modifiers run on the next tick.

## Check the result

```js
const seneca = Seneca().use('@seneca/doc').use('seneca-shop')

seneca.ready(function () {
  const actdef = this.find('role:shop,cmd:price')
  console.log(actdef ? actdef.desc : 'no such action')
  this.close()
})
```
