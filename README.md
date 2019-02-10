# seneca-doc

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


### Supported documentation properties

The following properties can be optionally attached to the action
function of a given message:

* `description`: String describing the action.
* `examples`: An object, where the keys are example paramers, and the values are description strings.
* `validate`: The validation object supported by [seneca-joi](github.com/senecajs/seneca-joi).
* `reply`: A literal object showing the reply object structure.

See the source of [seneca-doc.js](seneca-doc.js) itself for a good
example of using these.

NOTE: plugin options are not currently supported - that would make a
great pull request! :)





<!--START:action-list-->


## Action Patterns

* [describe:plugin,role:doc](#-describepluginroledoc-)
* [describe:pin,role:doc](#-describepinroledoc-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `describe:plugin,role:doc` &raquo;

Provide introspection data for a plugin and its actions.




#### Examples



* `describe:plugin,role:doc,plugin:entity`
  * Describe the seneca-entity plugin.

* `describe:plugin,role:doc,plugin:entity$foo`
  * Describe the seneca-entity plugin instance with tag _foo_.
#### Parameters


* _plugin_: string <i><small>{presence:required}</small></i>
  * The full name of the plugin (if tagged, use the form name$tag).




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
### &laquo; `describe:pin,role:doc` &raquo;

Provide introspection data for actions matching a _pin_ (a sub pattern).




#### Examples



* `describe:pin,role:doc,pin:"a:1,b:2"`
  * Describe actions matching at least `a:1,b:2`.
#### Parameters


* _pin_: alternatives <i><small>{presence:required}</small></i>
  * The pin sub pattern in string or object format.




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

