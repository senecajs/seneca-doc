![Seneca Doc](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Doc_ is a plugin for [Seneca](http://senecajs.org)


Provides generated documentation for Seneca plugins and injects this 
documentation into the plugin README.md markdown file.


[![npm version](https://img.shields.io/npm/v/@seneca/doc.svg)](https://npmjs.com/package/@seneca/doc)
[![build](https://github.com/senecajs/seneca-doc/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-doc/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/senecajs/seneca-doc/badge.svg?branch=master)](https://coveralls.io/github/senecajs/seneca-doc?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-doc/badge.svg)](https://snyk.io/test/github/senecajs/seneca-doc)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/25451/branches/796879/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=25451&bid=796879)
[![Maintainability](https://api.codeclimate.com/v1/badges/83a38bd880993e70afc1/maintainability)](https://codeclimate.com/github/senecajs/seneca-doc/maintainability)


| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Documentation helper for [Seneca](senecajs.org) plugins.


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

## Usage

This utility plugin updates the `README.md` file in a Seneca plugin
repository with auto-generated documentation. Special HTML comment
markers are used to indicate the insertion point, and all markdown
within these markers is replaced.

* _&lt;!--START:action-list--&gt; ... &lt;!--END:action-list--&gt;_
  * Inserts a list of action patterns defined by the plugin
* _&lt;!--START:action-desc--&gt; ... &lt;!--END:action-desc--&gt;_
  * Inserts more detailed action descriptions (linked to by _action-list_)

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
generated. You can use this handle cases where your plugin has
additional dependencies that fail when it is loaded direcly by
_seneca-doc_.

See the unit tests for examples of usage.

NOTE: Plugins must be loaded via `seneca.use()` for validation to
activate (as well as depending on a validation plugin such as as
`seneca-joi`). In particular, when testing, ensure that the plugin
under test is loaded with `seneca.use('..')` (assuming tests are
within a _test_ subfolder).

NOTE: must be loaded *before* `seneca-joi` so that the rules are
available to `seneca-joi`.


## Arguments

The `seneca-doc` command takes the following command line arguments:

* -p - **fully qualified** plugin name (can be used for multiple plugins)
  that is needed by the plugin definition function. Example:
  ```
  seneca-doc -p seneca-entity -p @seneca/graph -p @seneca/owner
  ```


### Supported documentation properties

The following properties can be optionally attached to the action
function of a given message:

* `desc`: String describing the action.
* `examples`: An object, where the keys are example paramers, and the values are description strings.
* `validate`: The validation object supported by [seneca-joi](//github.com/senecajs/seneca-joi).
* `reply`: A literal object showing the reply object structure.

See the source of [seneca-doc.js](seneca-doc.js#L29) itself for a good
example of using these.

NOTE: plugin options are not currently supported - that would make a
great pull request! :)

The *Action Patterns* and *Action Descriptions* sections below are
examples of the generated output, run on the _seneca-doc_ plugin
itself.


<!--START:options-->


## Options

*None.*


<!--END:options-->


<!--START:action-list-->


## Action Patterns

* ["sys":"doc","describe":"pin"](#-sysdocdescribepin-)
* ["sys":"doc","describe":"plugin"](#-sysdocdescribeplugin-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `"sys":"doc","describe":"pin"` &raquo;

Provide introspection data for actions matching a _pin_ (a sub pattern).




#### Examples



* `"sys":"doc","describe":"pin",pin:"a:1,b:2"`
  * Describe actions matching at least `a:1,b:2`.
#### Parameters


* _pin_ : alternatives <i><small>"&nbsp;"</small></i>
 : The pin sub pattern in string or object format.




#### Replies With


```
{
  pin: 'pin parameter',
  actions: [
    '{ Seneca action definition }'
  ]
}
```


----------
### &laquo; `"sys":"doc","describe":"plugin"` &raquo;

Provide introspection data for a plugin and its actions.




#### Examples



* `"sys":"doc","describe":"plugin",plugin:entity`
  * Describe the seneca-entity plugin.

* `"sys":"doc","describe":"plugin",plugin:entity$foo`
  * Describe the seneca-entity plugin instance with tag _foo_.
#### Parameters


* _plugin_ : string <i><small>"&nbsp;"</small></i>
 : The full name of the plugin (if tagged, use the form name$tag).




#### Replies With


```
{
  plugin: 'plugin parameter',
  actions: [
    '{ Seneca action definition }'
  ]
}
```


----------


<!--END:action-desc-->


[BadgeCoveralls]: https://coveralls.io/repos/voxgig/seneca-doc/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/%40seneca%2Fdoc.svg
[BadgeTravis]: https://travis-ci.org/voxgig/seneca-doc.svg?branch=master
[Coveralls]: https://coveralls.io/github/voxgig/seneca-doc?branch=master
[Npm]: https://www.npmjs.com/package/@seneca/doc
[Travis]: https://travis-ci.org/voxgig/seneca-doc?branch=master

