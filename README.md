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

Documentation helper for [Seneca](http://senecajs.org) plugins.

## Install

```sh
$ npm install @seneca/doc -D
```

Add to your `package.json`:

```json
{
  "scripts": {
    "seneca-doc": "seneca-doc"
  }
}
```

And run with

```sh
$ npm run seneca-doc
```

## Quick Example

This utility plugin updates the `README.md` file in a Seneca plugin
repository with auto-generated documentation. Special HTML comment
markers are used to indicate the insertion point, and all markdown
within these markers is replaced.

* _&lt;!--START:action-list--&gt; ... &lt;!--END:action-list--&gt;_
  * Inserts a list of action patterns defined by the plugin
* _&lt;!--START:action-desc--&gt; ... &lt;!--END:action-desc--&gt;_
  * Inserts more detailed action descriptions (linked to by _action-list_)

## More Examples

See [test/](test/) and [doc-doc.js](doc-doc.js) for usage examples.

## Motivation

Automatically generates documentation for Seneca plugins based on their action patterns.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-doc/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Usage

In the top level folder of your project, create a module called
`plugin-doc.js` where _plugin_ is the name of your plugin. This should
return an object whose keys are the names of the action functions in
your plugin. Each key should define an action description with
properties as defined below. For an example,
see [doc-doc.js](doc-doc.js) which defines the documentation for this
plugin.

Alternatively, return the same data structure from your plugin
definition under the `doc` property.

The export `doc/generating` will be `true` if documentation is being
generated. You can use this to handle cases where your plugin has
additional dependencies that fail when it is loaded directly by
_seneca-doc_.

See the unit tests for examples of usage.

NOTE: Plugins must be loaded via `seneca.use()` for validation to
activate (as well as depending on a validation plugin such as
`seneca-joi`). In particular, when testing, ensure that the plugin
under test is loaded with `seneca.use('..')` (assuming tests are
within a _test_ subfolder).

NOTE: must be loaded *before* `seneca-joi` so that the rules are
available to `seneca-joi`.

### Arguments

The `seneca-doc` command takes the following command line arguments:

* `-p` - **fully qualified** plugin name (can be used for multiple plugins). Example:
  ```sh
  seneca-doc -p seneca-entity -p @seneca/graph -p @seneca/owner
  ```

### Supported documentation properties

* `desc`: String describing the action.
* `examples`: An object, where the keys are example parameters, and the values are description strings.
* `validate`: The validation object supported by [seneca-joi](//github.com/senecajs/seneca-joi).
* `reply`: A literal object showing the reply object structure.

### Options

* `test` : boolean
* `errors` : object
* `init$` : boolean

### Action Patterns

* [sys:doc,describe:pin](#-sysdocdescribepin-)
* [sys:doc,describe:plugin](#-sysdocdescribeplugin-)

### Action Descriptions

#### &laquo; `sys:doc,describe:pin` &raquo;

Provide introspection data for actions matching a _pin_ (a sub pattern).

#### Replies With

```json
{
  "pin": "pin parameter",
  "actions": [
    "{ Seneca action definition }"
  ]
}
```

----------

#### &laquo; `sys:doc,describe:plugin` &raquo;

Provide introspection data for a plugin and its actions.

#### Replies With

```json
{
  "plugin": "plugin parameter",
  "actions": [
    "{ Seneca action definition }"
  ]
}
```

----------

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Generates markdown documentation from Seneca action pattern definitions.
