# Errors reference

## Error codes

Errors created by the plugin, with `err.code` and the message template
(`<%=msg%>` is the message that caused the error):

| Code | Message | Raised by |
| ---- | ------- | --------- |
| `plugin_missing` | `Plugin name missing from message: <%=msg%>` | `sys:doc,describe:plugin` and the `doc/describe_plugin` export, when `plugin` is absent. |
| `pin_missing` | `Pin missing from message: <%=msg%>` | `sys:doc,describe:pin`, when `pin` is absent. |

The errors are Seneca errors and reach the `act` callback (or reject
the `post` promise) unchanged, on Seneca 3.38 and 4: for example
`err.code === 'plugin_missing'`,
`err.message === 'seneca: Plugin name missing from message: {sys:doc,describe:plugin}'`
and `err.details.msg` is the message.

## Doc definition validation errors

Doc definitions are validated with Joi each time an action of the
plugin is processed, on the tick after `seneca.add()`, so an invalid
definition fails with the first action. A failure throws
a Joi `ValidationError` from the action modifier, which is not inside
an action: it is an uncaught exception that terminates the process (the
`seneca-doc` tool exits with code 1). The message names the problem:

| Message | Cause |
| ------- | ----- |
| `invalid "messages" is required` | The definition has no `messages`. |
| `invalid "<property>" is not allowed` | A property other than `messages` and `sections` at the top level. |
| `action <pattern> (<function name>) documentation invalid "<property>" is not allowed` | A message description with a property other than `desc`, `validate`, `examples`, `reply_desc` and `path`, for example the common mistake `reply` instead of `reply_desc`. |
| `action <pattern> (<function name>) documentation invalid "<property>" must be ...` | A message description property of the wrong type (for example `desc` not a string). |
| `invalid "path" is required` | A section without `path`; thrown by the tool when rendering sections. |

A doc file that cannot be loaded for a reason other than
`MODULE_NOT_FOUND` (for example a syntax error) throws the loading
error in the same way. A doc file whose own `require` of another module
fails with `MODULE_NOT_FOUND` produces no error at all: the file is
skipped (see [Doc definition](doc-definition.md#where-doc-definitions-are-found)).

## Validation errors from seneca-joi

When seneca-joi is loaded after `@seneca/doc`, a message that fails the
`validate` rules of its doc definition gets an `act_invalid_msg` error
from Seneca before the action runs (see
[Describe message parameters with Joi](../how-to/validate-message-parameters-with-joi.md)).

## Plugin option errors

On Seneca 4, and on Seneca 3 with Gubu option validation, loading
`@seneca/doc` with an unknown option is an `invalid_plugin_option`
error from Seneca; the default Joi option validation of Seneca 3
accepts it (see [Options](options.md)).
