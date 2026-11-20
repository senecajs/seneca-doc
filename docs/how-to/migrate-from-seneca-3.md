# Migrate from Seneca 3

What changes for a plugin documented with `@seneca/doc` when the
project moves from Seneca 3 to Seneca 4. The general migration of
Seneca code is covered by the Seneca documentation; this page is about
the documentation tooling.

## 1. Update the dependencies

`@seneca/doc` 9 declares `seneca` `^4.0.0` as a peer dependency and uses
the Seneca installed in your project. Install Seneca 4 and the current
tool:

```sh
npm install seneca@^4
npm install @seneca/doc@^9 -D
```

Seneca 4 and `@seneca/doc` 9 require Node.js 24 or later. `@seneca/doc`
8.0 had `seneca@^3.36.0` as a regular dependency; with 9 make sure
`seneca` is a dependency of your own project. Seneca 3 projects stay on
`@seneca/doc` 8.0.x.

## 2. Replace Joi in your doc files

Seneca 4 does not provide Joi (`seneca.util.Joi` is undefined), and
`@seneca/doc` 9 neither depends on Joi nor passes it to doc definitions
in function form. Write `validate` rules with the Shape builders of
Seneca instead. The function form receives them as `valid`:

```js
module.exports = function (seneca, { valid }) {
  return {
    messages: {
      stock: {
        validate: {
          item: valid.Required(String).Describe('Item identifier.')
        }
      }
    }
  }
}
```

A doc definition in function form that still reads `Joi` from its
second argument fails with an error that says so. A doc file that
requires Joi itself keeps working if Joi is a dependency of your
project, and its Joi rules are still rendered. Check the result after
the upgrade: a doc file whose `require` of a missing package fails is
skipped without an error, and its actions are then documented as
`No description provided.`. See
[Describe message parameters](describe-message-parameters.md).

## 3. Put enforced rules in the patterns

`validate` rules of a doc definition are documentation: neither
`@seneca/doc` nor Seneca enforces them. Rules in the pattern are
compiled and enforced by Seneca 4, and `@seneca/doc` renders them too:

```js
seneca.add('role:shop,cmd:stock', { item: String }, function stock(msg, reply) { ... })
```

## 4. Check the Options section

The Options section is generated from the plugin `defaults`, as Seneca
4 reads them: a plain object, a shape built with `valid`, or a function
`({ valid }) => ...` that returns either. Joi schemas as `defaults` are
not validated by Seneca 4 and `@seneca/doc` has nothing to render for
them (`*None.*`): convert them to plain defaults or Shape builders.

## 5. Remove legacy options from tests

Seneca 4 accepts only `legacy: true|false` or
`legacy: { error, meta, builtin_actions }`. Test code that created
instances with `legacy: { transport: false }` or similar must drop
those keys. `await seneca.ready()` and `await seneca.close()` work
without seneca-promisify.

## 6. Drop seneca-promisify

`seneca.post`, `seneca.message` and promise returning `ready()` and
`close()` are built into Seneca 4, so runtime queries no longer need
seneca-promisify. `@seneca/doc` does not depend on it.

## 7. Nothing changes in the generator workflow

`npm run doc`, the markers and the generated sections are the same. The
errors of the plugin's own messages (`plugin_missing`, `pin_missing`)
reach the caller with the same `code`.
