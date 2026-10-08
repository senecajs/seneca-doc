# How @seneca/doc works

This page explains the design of `@seneca/doc`: why documentation is
kept next to the actions, how it is collected, how the README is
generated, and what differs between Seneca 3 and 4.

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
be loaded before the plugins it documents, and before any plugin that
reads `rules` to enforce them (seneca-joi registers its own modifier
when it loads; loaded after `@seneca/doc`, it runs after the one that
adds the rules). Second, documentation is attached per action: the
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

## Seneca 3 versus Seneca 4

The plugin supports both, with these differences in what it does:

| Topic | Seneca 3 | Seneca 4 |
| ----- | -------- | -------- |
| Joi | `seneca.util.Joi` exists. | Not provided; `@seneca/doc` uses its own `@hapi/joi` and passes it to doc definitions in function form. |
| Options shape | Recorded on the plugin record (`options_shape`) when options are validated with Gubu, as with the tool's `legacy: false`; with the default Joi option validation `@seneca/doc` builds it from `defaults`. | Not recorded; `@seneca/doc` builds it from `defaults` with `seneca.valid`. |
| `init$` directive | Accepted in the options passed to `use()`. | Rejected by option validation for plugins with `defaults`; the tool sets it on the resolved options instead. |
| `ready()` | Callback, or promise with seneca-promisify. | Built in promise, but the tool uses the callback form because the promise form does not resolve on an idle instance in 4.0.0-rc5. |
| Fatal errors | Terminate the process. | Terminate the process in 4.0.0; not in 4.0.0-rc5, so the tool sets its exit code itself. |

What does not differ: `validate` rules are enforced on both only when
seneca-joi is loaded after `@seneca/doc`; the errors of the plugin's
messages reach callers unchanged; and the `legacy: false` option used by
the tool is valid on both versions.

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
