# Getting started: document a plugin

In this tutorial you write a small Seneca plugin, describe its messages
in a doc file, generate the API sections of its README with the
`seneca-doc` tool, and query the same documentation at runtime. It
takes about fifteen minutes. The finished project is in
[docs/examples/shop](../examples/shop/).

## 1. Set up a project

`@seneca/doc` needs Node.js 22 or later (24 recommended) and Seneca
installed in your project, either Seneca 3 or the Seneca 4 prerelease
(4.0.0-rc5 or later). In a new directory:

```sh
npm init -y
npm install seneca
npm install @seneca/doc -D
```

Edit `package.json` so that `main` names the plugin module and a script
runs the tool:

```json
{
  "name": "seneca-shop",
  "main": "shop.js",
  "scripts": {
    "doc": "seneca-doc"
  }
}
```

The tool documents the plugin that `main` points at, and it uses the
`seneca` installed in the project.

## 2. Write the plugin

Create `shop.js`:

```js
// An example Seneca plugin: a tiny shop with three messages.
module.exports = shop

shop.defaults = {
  currency: 'EUR',
  tax: { rate: 0.2 }
}

shop.errors = {
  no_item: 'Item <%=id%> not found.'
}

function shop(options) {
  const seneca = this

  // Runs when the plugin loads normally, but not when seneca-doc
  // generates documentation.
  seneca.init(function (done) {
    console.log('shop: init (connect to databases here)')
    done()
  })

  // Rules in the pattern are Gubu shapes; seneca-doc renders them.
  // (A plain number would be a pattern value, so Default marks a rule.)
  seneca.add(
    'role:shop,cmd:price',
    { item: String, quantity: seneca.valid.Default(1) },
    function price(msg, reply) {
      const net = msg.quantity * 10
      reply({
        price: net * (1 + options.tax.rate),
        currency: options.currency
      })
    }
  )

  seneca.add('role:shop,cmd:stock', function stock(msg, reply) {
    reply({ item: msg.item, count: 1, warehouse: msg.warehouse || 'main' })
  })

  seneca.add('role:shop,cmd:help', function help(msg, reply) {
    reply({ topics: ['price', 'stock'] })
  })
}
```

Two details matter for documentation. The action functions have names
(`price`, `stock`, `help`): the doc file refers to actions by these
names. And `shop.defaults` declares the options: the tool renders them
in the Options section.

## 3. Describe the messages

Create `shop-doc.js` next to `shop.js`. The tool finds it by name:
`<plugin name>-doc.js` in the folder of the plugin module.

```js
// Documentation of the shop plugin messages, keyed by action function name.
// The function form receives the Seneca instance and the Joi copy used by
// @seneca/doc, so this file needs no dependency of its own.
module.exports = function (seneca, { Joi }) {
  return {
    messages: {
      price: {
        desc: 'Calculate the gross price of a quantity of an item.',
        examples: {
          'item:apple,quantity:2': 'Price of two apples.'
        },
        reply_desc: {
          price: 'gross price',
          currency: 'currency code from the plugin options'
        }
      },

      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: Joi.string()
            .required()
            .description('Item identifier.'),
          warehouse: Joi.string()
            .default('main')
            .description('Warehouse name.')
        },
        reply_desc: {
          item: 'item identifier',
          count: 'units in stock',
          warehouse: 'warehouse name'
        }
      },

      help: {
        // Hand written documentation replaces the generated description.
        path: 'help.md'
      }
    },

    // Files injected between <!--START:SECTION:name--> and <!--END:SECTION:name-->.
    sections: {
      usage: { path: 'usage.md' }
    }
  }
}
```

Each key of `messages` is the name of an action function. A message
description has a `desc`, optional `examples` (extra pattern
properties, with a description of each case), optional `validate`
rules describing the message parameters, and an optional `reply_desc`
showing the shape of the reply. The `help` message uses `path`
instead: the content of `help.md` is inserted as its documentation.
`sections` names further files to insert into the README.

Create the two text files. `help.md`:

```markdown
List the help topics of the shop. This text comes from `help.md`, named by
the `path` property of the `help` message documentation.

Replies with `{ topics: ['price', 'stock'] }`.
```

And `usage.md`:

````markdown
Load the plugin after `@seneca/doc` (optional) and set the currency:

```js
seneca.use('@seneca/doc').use('shop', { currency: 'USD' })
```

This text comes from `usage.md`, named by `sections.usage.path` in
`shop-doc.js`.
````

Both paths are relative to the folder where you run the tool.

## 4. Add markers to the README

Create `README.md`. Each pair of marker comments is replaced by a
generated section; the rest of the file is left alone:

```markdown
# seneca-shop

An example plugin documented with `@seneca/doc`. Everything between the
`START` and `END` markers below is generated by running `npm run doc`.

## Usage

<!--START:SECTION:usage-->
<!--END:SECTION:usage-->

## Options

<!--START:options-->
<!--END:options-->

## Actions

<!--START:action-list-->
<!--END:action-list-->

<!--START:action-desc-->
<!--END:action-desc-->
```

## 5. Generate the documentation

```sh
npm run doc
```

The command prints nothing and exits. Open `README.md`: the markers are
still there, and the text between them is generated. The Options
section lists the `defaults`, nested options as `parent.child`, each
with its default value:

```markdown
<!--START:options-->


## Options

* `currency` : string <i><small>"EUR"</small></i>
* `tax.rate` : number <i><small>0.2</small></i>


<!--END:options-->
```

The action list links to the descriptions, with `role` and `sys`
properties placed first in every pattern:

```markdown
## Action Patterns

* [role:shop,cmd:help](#-roleshopcmdhelp-)
* [role:shop,cmd:price](#-roleshopcmdprice-)
* [role:shop,cmd:stock](#-roleshopcmdstock-)
```

The description of `stock` combines the `desc`, the Joi rules and the
`reply_desc`:

````markdown
### &laquo; `role:shop,cmd:stock` &raquo;

Report the stock level of an item.



#### Parameters


* __item__ : string <i><small>required</small></i>
 : Item identifier.
* __warehouse__ : string <i><small>"main"</small></i>
 : Warehouse name.




#### Replies With


```
{
  item: 'item identifier',
  count: 'units in stock',
  warehouse: 'warehouse name'
}
```


----------
````

The description of `price` renders the Gubu rules of its pattern
(`item` is required, `quantity` is optional with default `1`) and the
example as a complete message pattern:
`role:shop,cmd:price,item:apple,quantity:2`. The description of `help`
is the content of `help.md`, and the Usage section is the content of
`usage.md`. The complete generated file is shown in the
[README markers reference](../reference/readme-markers.md#example).

Note that `shop: init (connect to databases here)` was not printed: the
tool loads the plugin to read its action definitions, but does not run
its init action.

## 6. Query the documentation at runtime

The descriptions are not only for the README. Once `@seneca/doc` is
loaded, every action definition carries them, and two messages give
access to them. Create `describe.js`:

```js
// Tutorial: Documenting a plugin. Query the documentation at runtime.
const Seneca = require('seneca')

const seneca = Seneca({ log: 'warn' })
  .use('@seneca/doc') // load @seneca/doc before the plugins to document
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
```

(The copy in the repository loads the plugin with
`require('../../..')` instead of `'@seneca/doc'`, because it lives
inside the `@seneca/doc` repository.) Run it from the project folder
with `node describe.js`. The folder matters: for a plugin loaded by a
relative path from the main script, `@seneca/doc` looks for the doc
file in the current directory (see
[Write a doc file](../how-to/write-a-doc-file.md#1-name-and-place-the-file)).
The output is:

```
shop: init (connect to databases here)
plugin: shop
options: USD { rate: 0.2 }
cmd:price,role:shop: Calculate the gross price of a quantity of an item.
cmd:stock,role:shop: Report the stock level of an item.
cmd:help,role:shop: No description provided.
patterns matching role:shop: 3
```

This time the init action ran, because the plugin was loaded normally.
The patterns appear in Seneca's canonical form (properties sorted
alphabetically). `help` has no `desc` because its documentation is a
file (`path`), which only the generator reads.

## 7. What happened

* `@seneca/doc` registers an *action modifier* when it loads: a function
  that Seneca calls for every action added afterwards. The modifier
  looks up the doc definition of the action's plugin and records
  `desc`, `examples`, `reply_desc`, `path` and the `validate` rules on
  the action definition. This is why `@seneca/doc` must be loaded
  before the plugins it documents.
* The `seneca-doc` tool creates a Seneca instance with your project's
  Seneca, loads `@seneca/doc`, loads the plugin named by `main` without
  running its init action, describes it, renders the sections and
  replaces the text between the markers in `README.md`.
* The `validate` rules describe parameters; `@seneca/doc` does not
  validate messages, but seneca-joi can enforce the rules. See
  [Describe message parameters with Joi](../how-to/validate-message-parameters-with-joi.md).

## Next steps

* [Write a doc file](../how-to/write-a-doc-file.md) covers the file
  name variants, the function form and hand written files.
* [Define the documentation inside the plugin](../how-to/use-meta-doc.md)
  is the alternative for plugins that are loaded by module name.
* [Run the generator](../how-to/run-the-generator.md) covers plugins
  with dependencies (`-p`) and pattern ordering (`-t`).
* [Doc definition reference](../reference/doc-definition.md) lists
  every property.
