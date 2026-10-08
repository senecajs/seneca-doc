# Write a doc file

How to describe the messages of a plugin in a separate `-doc.js` file
that `@seneca/doc` loads next to the plugin module. The complete
specification is in the [Doc definition reference](../reference/doc-definition.md).

## 1. Name and place the file

`@seneca/doc` looks for the file in the folder of the plugin module,
trying these names in order, where `<name>` is the plugin name (the
name of the definition function, or, when it has none, the module name
without a `seneca-` prefix):

```
<name>-doc.js
<name>Doc.js
src/<name>-doc.js
src/<name>Doc.js
dist/<name>-doc.js
dist/<name>Doc.js
```

Each name is also tried with underscores in `<name>` replaced by
dashes. For a plugin `shop.js`, create `shop-doc.js`; for a TypeScript
plugin compiled to `dist/shop.js`, `dist/shop-doc.js` works too.

The `seneca-doc` tool always finds the file: it loads the plugin by the
absolute path of `package.json` `main`. At runtime the folder depends
on how the plugin was loaded:

| Loaded with | Folder searched |
| ----------- | --------------- |
| An absolute path, `seneca.use(Path.join(__dirname, 'shop'))` | The directory of that path. |
| `seneca.use('..')` in a test file | The parent of the test file's folder. |
| `seneca.use('./shop')` | The directory of the module that resolved the path (normally the script that required Seneca). For the main script of the process this is the current working directory, not the script's folder: run the script from its own folder, or use an absolute path. |
| `seneca.use('./plugins/shop')` | Same as `./shop`: the `plugins` folder is not searched. Use an absolute path. |
| A module name, `seneca.use('seneca-shop')` | Not the package folder, so the file is not found. |
| A function, `seneca.use(shop)` | No lookup. |

For the last two cases, and whenever the plugin must carry its
documentation wherever it is loaded, see
[Define the documentation inside the plugin](use-meta-doc.md). The
exact rules are in the
[Doc definition reference](../reference/doc-definition.md#where-doc-definitions-are-found).

## 2. Write the object form

The simplest file exports a plain object:

```js
// shop-doc.js
module.exports = {
  messages: {
    price: {
      desc: 'Calculate the gross price of a quantity of an item.',
      examples: {
        'item:apple,quantity:2': 'Price of two apples.'
      },
      reply_desc: { price: 'gross price', currency: 'currency code' }
    },
    stock: {
      desc: 'Report the stock level of an item.'
    }
  }
}
```

`messages` is required. Its keys are the names of the action functions
of the plugin, so give your action functions names:

```js
seneca.add('role:shop,cmd:price', function price(msg, reply) { ... })
```

An action whose function has no entry in `messages` is documented as
`No description provided.`. Only the properties `desc`, `validate`,
`examples`, `reply_desc` and `path` are allowed in a message
description; any other property is an error that stops the process
when the plugin's actions are added (see [Errors](../reference/errors.md#doc-definition-validation-errors)).

## 3. Use the function form for Joi rules

To describe parameters with Joi without adding Joi to your own
dependencies, export a function. It receives the Seneca instance and an
object with the `Joi` copy used by `@seneca/doc`:

```js
module.exports = function (seneca, { Joi }) {
  return {
    messages: {
      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: Joi.string().required().description('Item identifier.')
        }
      }
    }
  }
}
```

See [Describe message parameters with Joi](validate-message-parameters-with-joi.md)
for how the rules are rendered and what they do.

## 4. Insert hand written files

For a message that needs more than a paragraph, write a Markdown file
and name it with `path`; its content replaces the generated description
of that message in the README:

```js
help: {
  path: 'docs/help.md'
}
```

To insert files elsewhere in the README, declare `sections` and add a
`SECTION:<name>` marker pair to the README:

```js
module.exports = {
  messages: { ... },
  sections: {
    usage: { path: 'docs/usage.md' }
  }
}
```

```markdown
<!--START:SECTION:usage-->
<!--END:SECTION:usage-->
```

Both kinds of path are read relative to the folder in which the
`seneca-doc` tool runs (normally the project root), and only by the
tool: at runtime, a message documented with `path` has no `desc`.

## 5. Load the plugin by path in tests

Doc files are found by path, so tests that check the documentation
should load the plugin under test by path, for example from a `test`
folder:

```js
seneca.use('@seneca/doc').use('..')
// or, independent of the folder layout:
seneca.use('@seneca/doc').use(require('path').join(__dirname, '..', 'shop.js'))
```

The result can be checked on the action definitions:

```js
const actdef = seneca.find('role:shop,cmd:price')
// actdef.desc, actdef.examples, actdef.reply_desc, actdef.rules
```
