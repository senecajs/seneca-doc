# seneca-doc

Documentation helper for [Seneca](senecajs.org) plugins.

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

