# Doc definition reference

A *doc definition* describes the messages of one plugin. This page
specifies its shape, where `@seneca/doc` looks for it, and what it
records on the action definitions. For a guided introduction see the
tutorial [Getting started](../tutorials/getting-started.md).

## The doc definition object

| Property | Type | Required | Meaning |
| -------- | ---- | -------- | ------- |
| `messages` | object | yes | Message documentation keyed by the *name of the action function* (`function price(msg, reply)` is documented under `price`). |
| `sections` | object | no | README sections keyed by section name; each value is `{ path }` (see below). |

No other property is allowed. The object is validated each time an
action of the plugin is processed; an invalid object throws a
validation error whose message starts with `invalid` when the first
action is processed (see
[Errors](errors.md#doc-definition-validation-errors)).

## Function form

A doc definition may be a function. It is called with the root Seneca
instance and a utilities object, and must return the definition object.
It is called each time an action of the plugin is processed (four
times for a plugin with three actions, in a test), so it should return
the same definition every time and have no side effects:

```js
module.exports = function (seneca, { Joi }) {
  return { messages: { ... } }
}
```

`Joi` is the `@hapi/joi` copy used by `@seneca/doc`, so that doc files
can build Joi rules without their own Joi dependency.

## Message documentation

Each value of `messages` is an object with these properties; no other
property is allowed.

| Property | Type | Meaning |
| -------- | ---- | ------- |
| `desc` | string | One sentence describing the action. Rendered first; default `No description provided.`. |
| `validate` | object | Rules describing message properties: keys are property names, values are Joi schemas (rendered with type, `required` or default, and `description`) or other values (rendered with `util.inspect`). Merged into the action's `rules`. Not enforced by `@seneca/doc` or by Seneca; enforced by seneca-joi when it is loaded after `@seneca/doc`. |
| `examples` | object | Keys are extra pattern properties as a string (`'item:apple,quantity:2'`), values describe the case. Rendered as `<pattern>,<key>` followed by the description. |
| `reply_desc` | object | A literal object showing the structure of the reply. Rendered with `util.inspect` under `#### Replies With`. |
| `path` | string | Path of a file whose content replaces the generated description of the action in the README. Relative to the working directory of the `seneca-doc` tool. Only the tool reads it. |

## Sections

`sections` maps a name to `{ path: string }` (`path` is required; other
properties are errors). The content of the file at `path`, relative to
the working directory of the `seneca-doc` tool, is inserted between
`<!--START:SECTION:<name>-->` and `<!--END:SECTION:<name>-->` in the
README (see [README markers](readme-markers.md#sectionname)). Sections
are validated when rendered, not when the plugin loads.

## Properties on the action function

Documentation can also be set directly on the action function, with
these precedence rules:

| Property | Read by | Effect |
| -------- | ------- | ------ |
| `fn.desc` | `@seneca/doc` | Used instead of the doc definition's `desc`. |
| `fn.examples` | `@seneca/doc` | Used instead of the doc definition's `examples`. |
| `fn.reply_desc` | `@seneca/doc` | Used instead of the doc definition's `reply_desc`. |
| `fn.validate` | Seneca (3 and 4) | Merged into the action's `rules` by Seneca's own action modifier, which runs before the `@seneca/doc` modifier. |

## Where doc definitions are found

For each action added after `@seneca/doc` was loaded, the plugin that
defined the action is looked up (`seneca.find_plugin(actdef.plugin_fullname)`)
and its doc definition is resolved, in this order:

1. `plugin.meta.doc`: the `doc` property of the object returned by the
   plugin definition function.
2. `plugin.define.doc` or `plugin.define.docdef`: a property of the
   plugin definition function.
3. A file, when the plugin was loaded by a string (`plugin.requirepath`
   is set). Seneca records `requirepath`, the string given to
   `seneca.use()`, and `modulepath`, the Node.js module id of the module
   whose `require` found the plugin (`.` for the main script of the
   process). The folder searched is:

   | `requirepath` | Folder |
   | ------------- | ------ |
   | Absolute (`/app/shop.js`, as the `seneca-doc` tool uses) | Its directory. |
   | Ends with `..` (`'..'`) | That path, resolved from the directory of `modulepath`. |
   | Starts with `..` (`'../lib/shop'`) | Its directory, resolved from the directory of `modulepath`. |
   | Anything else (`'./shop'`, `'./plugins/shop'`, `'seneca-shop'`) | The directory of `modulepath`. The folders in the string are not used, and for the main script this is the current working directory. |

   The file names tried, in order, are `<name>-doc.js`, `<name>Doc.js`,
   `src/<name>-doc.js`, `src/<name>Doc.js`, `dist/<name>-doc.js`,
   `dist/<name>Doc.js`, each also with underscores in `<name>` replaced
   by dashes, where `<name>` is `actdef.plugin_name`. The first file
   that loads is used. Only `MODULE_NOT_FOUND` errors are ignored: a doc
   file that fails to load for another reason throws. This includes a
   `MODULE_NOT_FOUND` raised by a `require` inside the doc file: a doc
   file that requires a module that is not installed is skipped without
   an error, and its actions show `No description provided.`.

A plugin given as a function has no `requirepath`, so only the first
two sources apply to it; a plugin loaded by module name is not found
in its package folder. Actions of the pseudo plugins `root$`, `root`
and `client$` (actions added outside plugins, and transport clients)
are not looked up.

The resolved definition is validated and stored on the plugin record as
`plugin.docdef`; when it came from a file, the file path is stored as
`plugin.docpath`. The lookup and validation run for every action of
the plugin.

## What is recorded

After `@seneca/doc` has processed an action, its action definition
(`seneca.find(pattern)`) has these fields:

| Field | Value |
| ----- | ----- |
| `desc` | `fn.desc`, else the doc definition's `desc`, else `No description provided.`. |
| `examples` | `fn.examples`, else the doc definition's `examples`, else `{}`. |
| `reply_desc` | `fn.reply_desc`, else the doc definition's `reply_desc`, else `null`. |
| `path` | The doc definition's `path`, else `null`. |
| `rules` | Existing rules with the doc definition's `validate` properties assigned over them. |

These fields are set for every action added after `@seneca/doc` loaded,
including actions of plugins without any doc definition.

## Timing

Seneca runs action modifiers on the tick after `seneca.add()`. The
documentation is therefore in place by the time `seneca.ready()` fires,
and action function properties may be assigned after the `add` call.
Actions added before `@seneca/doc` was loaded are never processed.
