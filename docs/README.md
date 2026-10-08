# @seneca/doc documentation

The documentation follows the [Diátaxis](https://diataxis.fr/)
structure: four sections with four different jobs. Start with the
tutorial if you are new to `@seneca/doc`; use the how-to guides for
specific tasks; look things up in the reference; read the explanation
to understand the design.

## Tutorials

| Tutorial | What you build |
| -------- | -------------- |
| [Getting started](tutorials/getting-started.md) | A documented plugin: a `-doc.js` file, generated README sections, and a runtime query. |

The complete example project is in [examples/shop](examples/shop/).

## How-to guides

| Guide | Covers |
| ----- | ------ |
| [Write a doc file](how-to/write-a-doc-file.md) | Where the `-doc.js` file goes, its shape, the function form, hand written files for actions and sections. |
| [Define the documentation inside the plugin](how-to/use-meta-doc.md) | `meta.doc`, the `doc` property of the definition function, properties on action functions. |
| [Describe message parameters with Joi](how-to/validate-message-parameters-with-joi.md) | `validate` rules, how they are rendered, enforcing them, Gubu rules in patterns. |
| [Run the generator](how-to/run-the-generator.md) | `npm run doc`, markers, plugin dependencies with `-p`, pattern ordering with `-t`, debugging a run. |
| [Query documentation at runtime](how-to/query-documentation-at-runtime.md) | `describe:plugin`, `describe:pin`, action definition fields, the exports. |
| [Migrate from Seneca 3](how-to/migrate-from-seneca-3.md) | What changes for plugins documented with `@seneca/doc` when moving to Seneca 4. |

## Reference

| Reference | Describes |
| --------- | --------- |
| [Doc definition](reference/doc-definition.md) | The doc definition object: `messages`, `sections`, every message property, where definitions are looked up, what is recorded on action definitions. |
| [Messages](reference/messages.md) | `sys:doc,describe:plugin`, `sys:doc,describe:pin`, the exports. |
| [Options](reference/options.md) | Every plugin option. |
| [Command line](reference/command-line.md) | The `seneca-doc` tool: requirements, flags, environment, what it loads, exit codes, programmatic use. |
| [README markers and generated sections](reference/readme-markers.md) | The marker comments and the exact content generated for each. |
| [Errors](reference/errors.md) | Error codes, doc definition validation errors, validation errors from seneca-joi. |

## Explanation

| Explanation | Topic |
| ----------- | ----- |
| [How @seneca/doc works](explanation/how-it-works.md) | Why documentation lives next to actions, how action modifiers collect it, the generation pipeline, Seneca 3 versus 4, limits. |

## Feature index

Every option, message pattern, export, error code, command line flag,
doc definition property, marker and recorded field, with the page that
documents it.

| Feature | Kind | Documented in |
| ------- | ---- | ------------- |
| `generating` | option | [Options](reference/options.md) |
| `test` | option | [Options](reference/options.md) |
| `sys:doc,describe:plugin` | message pattern | [Messages](reference/messages.md#sysdocdescribeplugin) |
| `sys:doc,describe:pin` | message pattern | [Messages](reference/messages.md#sysdocdescribepin) |
| `doc/describe_plugin` | export | [Messages](reference/messages.md#exports) |
| `doc/generating` | export | [Messages](reference/messages.md#exports), [Options](reference/options.md) |
| `plugin_missing` | error code | [Errors](reference/errors.md) |
| `pin_missing` | error code | [Errors](reference/errors.md) |
| Doc definition validation errors | errors | [Errors](reference/errors.md#doc-definition-validation-errors) |
| `seneca-doc` | command | [Command line](reference/command-line.md) |
| `-p <plugin>` | command line flag | [Command line](reference/command-line.md#flags) |
| `-t <names>` | command line flag | [Command line](reference/command-line.md#flags) |
| `SENECA_DOC_VERBOSE` | environment variable | [Command line](reference/command-line.md#environment) |
| Exit codes 0, 1, 2 | command | [Command line](reference/command-line.md#exit-codes) |
| `npm run doc` | script | [Run the generator](how-to/run-the-generator.md) |
| `messages` | doc definition property | [Doc definition](reference/doc-definition.md#the-doc-definition-object) |
| `sections` | doc definition property | [Doc definition](reference/doc-definition.md#sections) |
| `desc` | message documentation property | [Doc definition](reference/doc-definition.md#message-documentation) |
| `validate` | message documentation property | [Doc definition](reference/doc-definition.md#message-documentation), [Describe message parameters with Joi](how-to/validate-message-parameters-with-joi.md) |
| `examples` | message documentation property | [Doc definition](reference/doc-definition.md#message-documentation) |
| `reply_desc` | message documentation property | [Doc definition](reference/doc-definition.md#message-documentation) |
| `path` | message documentation property | [Doc definition](reference/doc-definition.md#message-documentation) |
| Function form `(seneca, { Joi })` | doc definition | [Doc definition](reference/doc-definition.md#function-form) |
| `meta.doc` | doc definition source | [Doc definition](reference/doc-definition.md#where-doc-definitions-are-found) |
| `define.doc`, `define.docdef` | doc definition source | [Doc definition](reference/doc-definition.md#where-doc-definitions-are-found) |
| `<name>-doc.js` and variants | doc definition source | [Doc definition](reference/doc-definition.md#where-doc-definitions-are-found) |
| Action function `desc`, `examples`, `reply_desc`, `validate` | documentation on the action | [Doc definition](reference/doc-definition.md#properties-on-the-action-function) |
| Action definition `desc`, `examples`, `reply_desc`, `path`, `rules` | recorded fields | [Doc definition](reference/doc-definition.md#what-is-recorded) |
| Plugin record `docdef`, `docpath` | recorded fields | [Doc definition](reference/doc-definition.md#what-is-recorded) |
| Reply `def`, `plugin`, `actions`, `options_shape` | reply fields | [Messages](reference/messages.md#sysdocdescribeplugin) |
| `<!--START:options-->` | README marker | [README markers](reference/readme-markers.md#options) |
| `<!--START:action-list-->` | README marker | [README markers](reference/readme-markers.md#action-list) |
| `<!--START:action-desc-->` | README marker | [README markers](reference/readme-markers.md#action-desc) |
| `<!--START:SECTION:name-->` | README marker | [README markers](reference/readme-markers.md#sectionname) |
| `lib/inspect.js`, `lib/render.js`, `lib/inject.js`, `lib/host-seneca.js` | programmatic modules | [Command line](reference/command-line.md#programmatic-use) |

## Other documents

* [Change log](../CHANGES.md)
* [Code of conduct](../CODE_OF_CONDUCT.md)
* [License](../LICENSE)
