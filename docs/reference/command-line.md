# Command line reference

The `seneca-doc` command (`bin/seneca-doc-exec.js`) generates the
documentation sections of the README of the plugin in the current
directory.

```
seneca-doc [-p <plugin>]... [-t <names>]
```

## Requirements

| Requirement | Detail |
| ----------- | ------ |
| `package.json` in the current directory | Its `main` names the plugin module to document. |
| `seneca` installed in the project | Resolved from the current directory (the host project), falling back to the copy visible from `@seneca/doc` itself. The project's version determines the behaviour (Seneca 3 or 4). |
| `README.md` in the current directory | The file that is rewritten. Marker pairs that are absent are simply not filled. |
| Dependencies of the plugin | Installed in `node_modules` and passed with `-p` when the plugin needs them to define itself. |

## Flags

| Flag | Repeatable | Effect |
| ---- | ---------- | ------ |
| `-p <plugin>` | yes | Load this plugin before the local plugin. `<plugin>` is the fully qualified module name as installed, for example `seneca-entity` or `@seneca/graph`; it is resolved as `node_modules/<plugin>` under the current directory and passed to Seneca's `plugins` option, so the plugins are loaded in the given order with their init actions. Their actions are not rendered. |
| `-t <names>` | no | Comma separated list of additional top level pattern property names. Rendered patterns list `role`, `sys` and these names first (alphabetically among themselves), then the other properties alphabetically. |

Unknown flags are ignored.

## Environment

| Variable | Effect |
| -------- | ------ |
| `SENECA_DOC_VERBOSE` | When set (to any value), the Seneca instance of the tool logs normally. Otherwise it is quiet. Seneca errors are printed to the console in both cases. |

## What the tool does

1. Reads `package.json` and resolves `main` to an absolute path.
2. Creates a Seneca instance from the project's `seneca` with options
   `{ legacy: false, plugins: [...] }` (the `plugins` entries are the
   resolved `-p` paths; the option is omitted without `-p`), an error
   handler that prints the error to the console and sets
   `process.exitCode` to 1, and quiet logging unless
   `SENECA_DOC_VERBOSE` is set.
3. Loads `@seneca/doc` with `{ generating: true }`, and waits for
   `ready` (callback form).
4. Adds a task to the plugin loading pipeline (`seneca.order.plugin`,
   after `post_meta`) that, for the local plugin only, sets the `init$`
   directive to `false` on the resolved plugin options so that the init
   action is not called, and describes the plugin with the
   `doc/describe_plugin` export once its actions are defined.
5. Loads the local plugin with `seneca.use(<main path>)`, and waits for
   `ready`.
6. Renders the sections `options`, `action-list`, `action-desc` and
   `SECTION:<name>` (see [README markers](readme-markers.md)) and
   replaces the text between the corresponding markers in `README.md`.

The Seneca instance is not closed explicitly; the process exits when
it becomes idle.

## Exit codes

| Code | When |
| ---- | ---- |
| 0 | The README was written. |
| 1 | Seneca reported an error (for example the plugin failed to define), or a doc definition is invalid (see [Errors](errors.md)). The README is not changed. |
| 2 | Seneca (4.0.0, and 3.38) terminated the process after a fatal error, once its `death_delay` (11111 milliseconds by default) had passed. The README is not changed. |

Seneca 4.0.0-rc5 does not terminate the process on a fatal error, so
when a plugin fails to define the tool waits until the plugin define
action times out (about 22 seconds) and then exits with code 1.
Measured with a plugin whose definition function throws: code 1 after
23 seconds on 4.0.0-rc5, code 2 after 11 seconds on 4.0.0 and on 3.38.
An invalid doc definition exits at once with code 1 (measured on
4.0.0-rc5 and 4.0.0).

## Programmatic use

The modules behind the command are part of the package:

| Module | Export | Purpose |
| ------ | ------ | ------- |
| `@seneca/doc/lib/inspect.js` | `async (folder, pkg, options, [init])` | Load and describe the plugin `pkg.main` of `folder`. `options` is `{ legacy, plugins, top }` as built by the command (`plugins` are module names, resolved under `folder/node_modules`; `top` is removed before the remaining options are passed to Seneca). `init(folder, pkg, seneca)` may adjust and return the instance before the local plugin loads. Resolves to the `describe:plugin` reply; does not resolve when the plugin fails to load. Sets `process.exitCode` to 1 when Seneca reports an error. |
| `@seneca/doc/lib/render.js` | `options(desc)`, `action_list(desc, { top })`, `action_desc(desc, { top })`, `sections(desc)` | Render a `describe:plugin` reply into arrays of `{ name, text }` injections; `intern` holds the helpers (`nicepat`, `patlink`, ...). |
| `@seneca/doc/lib/inject.js` | `update_source(source, injections)`, `update_file(path, injections)` | Replace the text between marker pairs. `injections` is an object whose values are arrays of `{ name, text }`. |
| `@seneca/doc/lib/host-seneca.js` | `(folder) => Seneca` | Require the `seneca` module of a project folder (default: the current directory), falling back to the copy visible from `@seneca/doc`. |
