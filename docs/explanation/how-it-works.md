# How @seneca/doc works

This page explains the design of `@seneca/doc`: why documentation is
kept next to the actions, how it is collected, how the README is
generated, and how it uses Seneca 4.

## Documentation lives next to the actions

A Seneca plugin is a set of message patterns and the functions that
handle them. The patterns are the public interface, but they are not
visible in one place: they are created by `seneca.add()` calls spread
over the definition function. Hand written API sections drift away from
the code, and nothing checks them.

`@seneca/doc` ties the documentation to the action functions. The doc
definition is keyed by function name, so adding, renaming or removing
an action is visible in the doc file, and an unknown documentation
property is an error. The descriptions are stored on the action
definitions at runtime, where a REPL, an admin message or a test can
read them (`sys:doc,describe:plugin`), and the README is generated from
the same data. There is one source of truth, and it is in the plugin
repository.

The data model is deliberately small: a sentence (`desc`), example
messages, parameter rules, a reply sketch, and an escape hatch (`path`)
for anything longer. It describes messages, which is what a plugin
user needs; options are taken from the plugin `defaults`, which Seneca
already validates.

## Action modifiers collect the documentation

Seneca keeps an array of *action modifiers*, functions called with each
new action definition on the tick after `seneca.add()`. Seneca's own
modifier merges the action function's `validate` property into the
action's rules; a plugin can add a modifier through the `extend.action_modifier`
meta data property, or by pushing onto the internal array
`seneca.private$.action_modifiers`. `@seneca/doc` does the latter in its
`preload` function, which Seneca calls before the plugin is defined, so
that the modifier is in place as early as possible.

For every action, the modifier finds the plugin record, resolves the
doc definition (meta data, definition function property, or a file next
to the module), validates it, and copies the action's description onto
the action definition: `desc`, `examples`, `reply_desc`, `path`, and the
`validate` rules into `rules`. Properties set directly on the action
function win over the doc definition.

Two consequences follow from this mechanism. First, order matters:
only actions added after `@seneca/doc` loaded are documented, so it must
be loaded before the plugins it documents. Second, documentation is attached per action: the
lookup and validation run for each action, and the result is stored on
the plugin record (`docdef`, `docpath`) for `describe:plugin` and the
renderer.

## The generation pipeline

The `seneca-doc` tool is a thin client of the plugin. It builds a Seneca
instance from the project's own `seneca`, with the plugins passed with
`-p` in its `plugins` option (so they load first), loads `@seneca/doc`
with `generating: true`, and then the local plugin. Loading, not requiring, is what makes the action
definitions complete: plugin options are resolved and validated,
`this.add()` records the plugin on each action, and the modifier runs.

The local plugin's init action is skipped. Init is where plugins
connect to databases and services, which a documentation build should
not need; the definition function alone must therefore be enough to
declare the actions, and `doc/generating` lets a plugin adapt when it is
not. The tool hooks the plugin loading pipeline (`seneca.order.plugin`)
right after the plugin's meta data is applied, both to set the `init$`
directive and to describe the plugin at that exact point, before the
instance moves on.

Rendering is a pure function of the `describe:plugin` reply:
`options` from the options shape, `action-list` and `action-desc` from
the action definitions, `sections` from files. Injection replaces the
text between marker pairs and leaves the rest of the README untouched,
so generated and hand written documentation live in the same file and
the command can be re-run at any time.

## Seneca 4

`@seneca/doc` 9 supports Seneca 4 only (Seneca 3 projects stay on
8.0.x). It relies on these parts of Seneca 4:

| Topic | How `@seneca/doc` uses it |
| ----- | ------------------------- |
| Validation | Seneca 4 validates with [Shape](https://github.com/rjrodger/shape) and provides its builders as `seneca.valid`. `@seneca/doc` validates doc definitions with them and passes them to doc definitions in function form. It does not depend on Joi, which Seneca 4 does not provide either. |
| Options shape | Seneca 4 does not record the shape of the plugin options; `@seneca/doc` builds it from `defaults` as Seneca does, and renders it from `shape.spec()`. |
| Rules | Rules in a pattern are compiled into `actdef.shape` and enforced; `validate` rules are merged into `actdef.rules` as documentation only. `@seneca/doc` renders the compiled shape when there is one, and otherwise the rules. Shapes and their nodes are recognised by the `shape$` marker, Joi schemas by their own marker. |
| `init$` directive | The tool sets it on the resolved options of the local plugin, in the plugin loading pipeline. |
| `ready()` | Returns a promise; the tool awaits it. |

The errors of the plugin's messages reach callers unchanged, and the
`legacy: false` option used by the tool is valid.

## Limits

* One doc definition per plugin; tagged instances of the same module
  share it.
* Actions are identified by function name. Anonymous action functions
  can only be documented through properties on the function (`desc`,
  `examples`, `reply_desc`).
* The file lookup depends on how the plugin was loaded. Plugins loaded
  by module name or as functions, and plugins loaded by a relative path
  from a script started in another directory, do not find their doc
  file at runtime; they must carry their documentation in `meta.doc` or
  on the definition function (see the
  [Doc definition reference](../reference/doc-definition.md#where-doc-definitions-are-found)).
  The tool always loads the local plugin by absolute path.
* Doc files are loaded with `require`, so they must be CommonJS modules
  (or compiled to them).
* The tool documents one plugin per project (`package.json` `main`) and
  writes only `README.md`. `path` and section paths are relative to the
  working directory of the tool.
* Doc definition validation errors are thrown from the action modifier,
  outside any action, so they stop the process: in the tool, and also
  in an application that loads `@seneca/doc` at runtime. A doc file
  that requires a module that is not installed, by contrast, is skipped
  without an error.
