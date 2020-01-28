# seneca-doc

[![Npm][BadgeNpm]][Npm]
[![Travis][BadgeTravis]][Travis]
[![Coveralls][BadgeCoveralls]][Coveralls]
[![Maintainability](https://api.codeclimate.com/v1/badges/68675302d30a1e3e9447/maintainability)](https://codeclimate.com/github/voxgig/seneca-doc/maintainability)


Documentation helper for [Seneca](senecajs.org) plugins.


## Install

```sh
$ npm install seneca-doc -D
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



<!--START:action-list-->


## Action Patterns

* [describe:plugin,sys:doc](#-describepluginsysdoc-)
* [describe:pin,sys:doc](#-describepinsysdoc-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `describe:plugin,sys:doc` &raquo;

Provide introspection data for a plugin and its actions.




#### Examples



* `describe:plugin,sys:doc,plugin:entity`
  * Describe the seneca-entity plugin.

* `describe:plugin,sys:doc,plugin:entity$foo`
  * Describe the seneca-entity plugin instance with tag _foo_.
#### Parameters


* _plugin_ : { type: 'string',
  '$_root':
   { _types:
      Set {
        'alternatives',
        'any',
        'array',
        'boolean',
        'date',
        'function',
        'link',
        'number',
        'object',
        'string',
        'symbol',
        'binary' },
     alternatives: [Function],
     any: [Function],
     array: [Function],
     boolean: [Function],
     date: [Function],
     function: [Function],
     link: [Function],
     number: [Function],
     object: [Function],
     string: [Function],
     symbol: [Function],
     binary: [Function],
     allow: [Function],
     custom: [Function],
     disallow: [Function],
     equal: [Function],
     exist: [Function],
     forbidden: [Function],
     invalid: [Function],
     not: [Function],
     only: [Function],
     optional: [Function],
     options: [Function],
     prefs: [Function],
     preferences: [Function],
     required: [Function],
     strip: [Function],
     valid: [Function],
     when: [Function],
     ValidationError: [Function: Error],
     version: '17.1.0',
     cache: { provision: [Function: provision] },
     assert: [Function: assert],
     attempt: [Function: attempt],
     build: [Function: build],
     checkPreferences: [Function: checkPreferences],
     compile: [Function: compile],
     defaults: [Function: defaults],
     expression: [Function: expression],
     extend: [Function: extend],
     isError: [Function: isError],
     isExpression: [Function: isTemplate],
     isRef: [Function],
     isSchema: [Function],
     in: [Function: in],
     override: Symbol(override),
     ref: [Function: ref],
     types: [Function: types],
     alt: [Function],
     bool: [Function],
     func: [Function],
     x: [Function: expression],
     trace: [Function: trace],
     untrace: [Function],
     [Symbol(@hapi/lab/coverage/initialize)]: [Function: trace] },
  '$_temp': { ruleset: false, whens: {} },
  _ids: { _byId: Map {}, _byKey: Map {}, _schemaChain: false },
  _preferences: null,
  _valids: null,
  _invalids: null,
  _rules: [],
  _singleRules: Map {},
  _refs: { refs: [] },
  _flags:
   { presence: 'required',
     description:
      'The full name of the plugin (if tagged, use the form name$tag).' },
  _cache: null,
  '$_terms':
   { alterations: null,
     examples: null,
     externals: null,
     metas: [],
     notes: [],
     shared: null,
     tags: [],
     whens: null,
     replacements: null },
  '$_super': {} }




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
### &laquo; `describe:pin,sys:doc` &raquo;

Provide introspection data for actions matching a _pin_ (a sub pattern).




#### Examples



* `describe:pin,sys:doc,pin:"a:1,b:2"`
  * Describe actions matching at least `a:1,b:2`.
#### Parameters


* _pin_ : { type: 'alternatives',
  '$_root':
   { _types:
      Set {
        'alternatives',
        'any',
        'array',
        'boolean',
        'date',
        'function',
        'link',
        'number',
        'object',
        'string',
        'symbol',
        'binary' },
     alternatives: [Function],
     any: [Function],
     array: [Function],
     boolean: [Function],
     date: [Function],
     function: [Function],
     link: [Function],
     number: [Function],
     object: [Function],
     string: [Function],
     symbol: [Function],
     binary: [Function],
     allow: [Function],
     custom: [Function],
     disallow: [Function],
     equal: [Function],
     exist: [Function],
     forbidden: [Function],
     invalid: [Function],
     not: [Function],
     only: [Function],
     optional: [Function],
     options: [Function],
     prefs: [Function],
     preferences: [Function],
     required: [Function],
     strip: [Function],
     valid: [Function],
     when: [Function],
     ValidationError: [Function: Error],
     version: '17.1.0',
     cache: { provision: [Function: provision] },
     assert: [Function: assert],
     attempt: [Function: attempt],
     build: [Function: build],
     checkPreferences: [Function: checkPreferences],
     compile: [Function: compile],
     defaults: [Function: defaults],
     expression: [Function: expression],
     extend: [Function: extend],
     isError: [Function: isError],
     isExpression: [Function: isTemplate],
     isRef: [Function],
     isSchema: [Function],
     in: [Function: in],
     override: Symbol(override),
     ref: [Function: ref],
     types: [Function: types],
     alt: [Function],
     bool: [Function],
     func: [Function],
     x: [Function: expression],
     trace: [Function: trace],
     untrace: [Function],
     [Symbol(@hapi/lab/coverage/initialize)]: [Function: trace] },
  '$_temp': { ruleset: false, whens: {} },
  _ids: { _byId: Map {}, _byKey: Map {}, _schemaChain: false },
  _preferences: null,
  _valids: null,
  _invalids: null,
  _rules: [],
  _singleRules: Map {},
  _refs: { refs: [] },
  _flags:
   { presence: 'required',
     description: 'The pin sub pattern in string or object format.' },
  _cache: null,
  '$_terms':
   { alterations: null,
     examples: null,
     externals: null,
     metas: [],
     notes: [],
     shared: null,
     tags: [],
     whens: null,
     matches: [ [Object], [Object] ] },
  '$_super': { label: [Function: bound label] } }




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


<!--END:action-desc-->


[BadgeCoveralls]: https://coveralls.io/repos/voxgig/seneca-doc/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/seneca-doc.svg
[BadgeTravis]: https://travis-ci.org/voxgig/seneca-doc.svg?branch=master
[Coveralls]: https://coveralls.io/github/voxgig/seneca-doc?branch=master
[Npm]: https://www.npmjs.com/package/seneca-doc
[Travis]: https://travis-ci.org/voxgig/seneca-doc?branch=master
