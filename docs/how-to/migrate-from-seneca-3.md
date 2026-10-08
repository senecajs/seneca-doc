# Migrate from Seneca 3

What changes for a plugin documented with `@seneca/doc` when the
project moves from Seneca 3 to Seneca 4 (4.0.0-rc5 or later). The
general migration of Seneca code is covered by the Seneca
documentation; this page is about the documentation tooling.

## 1. Update the dependencies

`@seneca/doc` 8.1.0 declares `seneca` as a peer dependency
(`>=3 || >=4.0.0-rc5`) and uses the Seneca installed in your project.
Install the Seneca 4 prerelease and the current tool:

```sh
npm install seneca@^4.0.0-rc5
npm install @seneca/doc@^8.1.0 -D
```

Seneca 4 requires Node.js 22 or later (24 recommended). `@seneca/doc`
8.0 had `seneca@^3.36.0` as a regular dependency; with 8.1 make sure
`seneca` is a dependency of your own project.

## 2. Check the Joi usage of your doc files

Seneca 4 does not depend on Joi, so `seneca.util.Joi` is undefined and
`require('@hapi/joi')` only works when Joi is a dependency of your
project. Either switch the doc file to the function form, which
receives the Joi copy of `@seneca/doc`:

```js
module.exports = function (seneca, { Joi }) {
  return { messages: { ... } }
}
```

or add `@hapi/joi` to your dependencies. Check the result after the
upgrade: a doc file whose `require('@hapi/joi')` fails is skipped
without an error, and its actions are then documented as
`No description provided.`.

## 3. Keep the validation plugin order

Nothing changes for `validate` rules: on both versions `@seneca/doc`
records them on the action definitions, and they are enforced only when
seneca-joi is loaded after `@seneca/doc` (tested with seneca-joi 7.0.2
on Seneca 3.38 and 4.0.0-rc5). If you move to Gubu rules in the
patterns, which Seneca 4 enforces on its own, `@seneca/doc` renders
those too. See
[Describe message parameters with Joi](validate-message-parameters-with-joi.md).

## 4. Check the Options section

On Seneca 4 (and on Seneca 3 with its default Joi option validation)
the Options section is generated from the plugin `defaults` when they
are a plain object or a Gubu shape. Joi schemas as `defaults` are deep
merged by Seneca 4 without validation, and `@seneca/doc` has nothing to
render for them (`*None.*`): convert them to plain defaults or Gubu
shapes.

## 5. Remove legacy options from tests

Seneca 4 accepts only `legacy: true|false` or
`legacy: { error, meta, builtin_actions }`. Test code that created
instances with
`legacy: { transport: false }` or similar must drop those keys (the
test suite of `@seneca/doc` did). Tests that `await seneca.ready()` on
an instance that has already finished loading should use the callback
form on 4.0.0-rc5 (`await new Promise((resolve) => seneca.ready(resolve))`);
the promise form is fixed in 4.0.0.

## 6. Drop seneca-promisify where it was only used for `post`

`seneca.post`, `seneca.message` and promise returning `ready()` and
`close()` are built into Seneca 4, so runtime queries no longer need
seneca-promisify (the plugin is a no-op on Seneca 4). `@seneca/doc`
itself no longer depends on it on either version.

## 7. Do not pass `init$` to plugins with defaults on 4.0.0-rc

Seneca 4 option validation rejects unknown keys in the options of a
plugin that declares `defaults` (`invalid_plugin_option`). In
4.0.0-rc5 this includes the `init$` directive, so code that loaded a
plugin with `seneca.use(plugin, { init$: false })` to skip its init
action, as `@seneca/doc` 8.0 did, fails there. The core fix
(senecajs/seneca#953, for 4.0.0) accepts the directives again, as
Seneca 3 does. The `seneca-doc` tool sets the directive on the resolved
options instead, which works on every version.

## 8. Nothing changes in the generator workflow

`npm run doc`, the markers and the generated sections are the same. The
errors of the plugin's own messages (`plugin_missing`, `pin_missing`)
reach the caller unchanged on both versions, with the same `code` and
message.
