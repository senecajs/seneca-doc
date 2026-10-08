![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/doc

[![npm version](https://img.shields.io/npm/v/@seneca/doc.svg)](https://npmjs.com/package/@seneca/doc)
[![build](https://github.com/senecajs/seneca-doc/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-doc/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-doc/badge.svg)](https://snyk.io/test/github/senecajs/seneca-doc)
[![Coverage Status](https://coveralls.io/repos/senecajs/seneca-doc/badge.svg?branch=master)](https://coveralls.io/github/senecajs/seneca-doc?branch=master)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/25451/branches/796879/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=25451&bid=796879)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Documentation helper for [Seneca](http://senecajs.org) plugins. You
describe the messages of a plugin in a `<name>-doc.js` file next to the
plugin (or inside the plugin itself); `@seneca/doc` attaches the
descriptions to the action definitions at runtime, answers
`sys:doc,describe:plugin` and `sys:doc,describe:pin` messages, and its
`seneca-doc` command line tool generates the Options, Action Patterns
and Action Descriptions sections of the plugin README. It works with
Seneca 3 and with the Seneca 4 prerelease (4.0.0-rc5 or later) on
Node.js 24 and 22.

The full documentation is in [docs/](docs/README.md): a tutorial,
how-to guides, reference pages and an explanation of how it works.

## Install

```sh
npm install @seneca/doc -D
```

`seneca` is a peer dependency: the plugin and the `seneca-doc` tool run
inside the Seneca installed in your project (version 3, or 4.0.0-rc5 or
later). Add a script to your `package.json`:

```json
{
  "scripts": {
    "doc": "seneca-doc"
  }
}
```

## Quick Example

Given a plugin `shop.js` (the `main` of your `package.json`), describe
its messages in `shop-doc.js` next to it, keyed by the names of the
action functions:

```js
// shop-doc.js
module.exports = function (seneca, { Joi }) {
  return {
    messages: {
      price: {
        desc: 'Calculate the gross price of a quantity of an item.',
        examples: { 'item:apple,quantity:2': 'Price of two apples.' },
        reply_desc: { price: 'gross price', currency: 'currency code' }
      },
      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: Joi.string().required().description('Item identifier.')
        },
        reply_desc: { item: 'item identifier', count: 'units in stock' }
      }
    }
  }
}
```

Put a pair of marker comments in your `README.md` where each generated
section should go:

```markdown
<!--START:name-->
<!--END:name-->
```

where `name` is `options`, `action-list` or `action-desc` (see
[README markers](docs/reference/readme-markers.md); the tutorial has a
complete README template).

Run `npm run doc`. Everything between the markers is replaced with the
generated sections; the
[README markers reference](docs/reference/readme-markers.md#example)
shows a complete generated README. The same descriptions are available
at runtime:

```js
const Seneca = require('seneca')

const seneca = Seneca().use('@seneca/doc').use('./shop')

seneca.act('sys:doc,describe:plugin', { plugin: 'shop' }, function (err, out) {
  if (err) console.error(err)
  else out.actions.forEach((actdef) => console.log(actdef.pattern, actdef.desc))
  seneca.close()
})
```

Run it from the folder of `shop.js` and `shop-doc.js`: when a plugin
is loaded by a relative path from the main script, its doc file is
looked up in the current directory (see
[Write a doc file](docs/how-to/write-a-doc-file.md)).

## More Examples

* [Tutorial: document a plugin and generate its README](docs/tutorials/getting-started.md),
  with the complete example project in [docs/examples/shop](docs/examples/shop/).
* How-to guides: [write a `-doc.js` file](docs/how-to/write-a-doc-file.md),
  [define the documentation inside the plugin](docs/how-to/use-meta-doc.md),
  [describe message parameters with Joi](docs/how-to/validate-message-parameters-with-joi.md),
  [run the generator from `npm run doc`](docs/how-to/run-the-generator.md),
  [query documentation at runtime](docs/how-to/query-documentation-at-runtime.md),
  [migrate from Seneca 3](docs/how-to/migrate-from-seneca-3.md).
* The [test suite](test/doc.test.js) and the plugin's own
  [doc-doc.js](doc-doc.js).

## Motivation

A Seneca plugin is a set of message patterns, and the only reliable
description of a pattern is the code that handles it. `@seneca/doc`
keeps the documentation next to that code, in the same repository and
keyed by the action functions, so that it can be checked, queried at
runtime and rendered into the README without copying. See
[How @seneca/doc works](docs/explanation/how-it-works.md).

## Support

If you're using this module and need help, you can:

- Post a [GitHub issue](https://github.com/senecajs/seneca-doc/issues)
- Read the [Seneca documentation](http://senecajs.org)
- Contact [Voxgig](https://www.voxgig.com), the sponsor of this module

## API

Messages (see [Messages](docs/reference/messages.md)):

| Pattern | Purpose |
| ------- | ------- |
| `sys:doc,describe:plugin` | Describe a plugin: its record, its action definitions and the shape of its options. |
| `sys:doc,describe:pin` | List the action definitions matching a pin (a sub pattern). |

Exports (see [Messages](docs/reference/messages.md#exports)):

| Export | Purpose |
| ------ | ------- |
| `doc/describe_plugin` | The function behind `describe:plugin`, for synchronous use. |
| `doc/generating` | `true` while the `seneca-doc` tool generates documentation. |

Options (see [Options](docs/reference/options.md)):

| Option | Default | Purpose |
| ------ | ------- | ------- |
| `generating` | `false` | Set by the tool; exported as `doc/generating`. |
| `test` | `false` | Not read; kept for compatibility. |

Doc definition properties (see [Doc definition](docs/reference/doc-definition.md)):
`messages` (keyed by action function name, each with `desc`,
`validate`, `examples`, `reply_desc`, `path`) and `sections`.

Command line tool (see [Command line](docs/reference/command-line.md)):
`seneca-doc [-p <plugin>]... [-t <names>]`, which fills the README
markers `options`, `action-list`, `action-desc` and `SECTION:<name>`
(see [README markers](docs/reference/readme-markers.md)).

Errors (see [Errors](docs/reference/errors.md)): `plugin_missing`,
`pin_missing`, and validation errors for invalid doc definitions. The
command exits with a non-zero code when generation fails (see
[Exit codes](docs/reference/command-line.md#exit-codes)).

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open
participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in
touch.

### Running tests

The tests use [jest](https://jestjs.io) and run on Node.js 24 (default)
and 22, against the Seneca 4 prerelease declared as a development
dependency:

```sh
npm install
npm test
```

To check against another Seneca build, install it without saving and
run the tests again, for example `npm install --no-save ../seneca-4.0.0.tgz && npm test`,
then `npm install` to restore the declared version. The tests include
an integration test with seneca-joi (a development dependency). The
example programs run from their folder:

```sh
cd docs/examples/shop
node describe.js
node ../../../bin/seneca-doc-exec.js
git checkout README.md
```

The generator run fills in the example's `README.md`; the last command
restores the committed version, which contains only the markers.

Changes to the GitHub Actions workflow are delivered as patches in
[.patches/](.patches/README.md) (`git am .patches/*.patch`), because
workflow files need a GitHub token with the `workflow` scope.

## Background

`@seneca/doc` was created in 2019 by Richard Rodger for Voxgig, as a
tool that generates the API sections of Seneca plugin READMEs.
Version 8.1.0 adds support for Seneca 4 (see the
[change log](CHANGES.md)).

| @seneca/doc | Seneca | Node.js |
| ----------- | ------ | ------- |
| 8.1.x | 3.x (tested with 3.38) and 4.0.0-rc5 or later (tested with 4.0.0-rc5 and the unreleased 4.0.0), as a peer dependency | 24 and 22 |
| 8.0.x | 3.x only (`seneca@^3.36.0` was a dependency) | As supported by the Seneca 3 release |

Licensed under [MIT](LICENSE).
