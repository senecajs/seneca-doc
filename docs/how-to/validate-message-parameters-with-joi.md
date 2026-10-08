# Describe message parameters with Joi

How to document the parameters of a message with Joi schemas in a doc
definition, how they are rendered, and how to have them enforced.

## 1. Add `validate` rules

In the doc definition, `validate` is an object whose keys are message
properties and whose values are rules. Use the function form of the doc
file to get the Joi copy of `@seneca/doc`:

```js
module.exports = function (seneca, { Joi }) {
  return {
    messages: {
      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: Joi.string().required().description('Item identifier.'),
          warehouse: Joi.string().default('main').description('Warehouse name.')
        }
      }
    }
  }
}
```

If your doc file is a plain object, `require('@hapi/joi')` yourself and
add `@hapi/joi` to your dependencies: Seneca 4 no longer provides Joi
(`seneca.util.Joi` does not exist there), and a doc file whose
`require` fails is skipped without an error.

## 2. See how they render

The generator lists each rule under `#### Parameters` with its Joi type,
`required` or the default value, and the `description`:

```markdown
#### Parameters

* __item__ : string <i><small>required</small></i>
 : Item identifier.
* __warehouse__ : string <i><small>"main"</small></i>
 : Warehouse name.
```

A rule value that is not a Joi schema is rendered with `util.inspect`.

## 3. Enforce them with seneca-joi

`@seneca/doc` merges the `validate` rules into `actdef.rules` of the
action, where `actdef` is the object returned by `seneca.find(pattern)`.
It does not validate messages itself, and Seneca does not enforce rules
added after the action was added: without a validation plugin, a
message with `item: 1` still reaches the action.

[seneca-joi](https://github.com/senecajs/seneca-joi) compiles
`actdef.rules` into a Joi validator in its own action modifier. Load it
after `@seneca/doc` (so that its modifier runs after the one that adds
the rules) and before the plugins it validates:

```js
seneca.use('@seneca/doc').use('seneca-joi').use('./shop')
```

An invalid message then fails with an `act_invalid_msg` error before
the action runs. This was tested with seneca-joi 7.0.2 on Seneca 3.38
and 4.0.0-rc5, and the test suite of `@seneca/doc` includes the case.

## 4. Prefer Gubu rules for enforced validation

When the rules must be enforced, put them in the pattern as Gubu
shapes. Seneca enforces them (an invalid message gets an
`act_invalid_msg` error) and `@seneca/doc` renders them from the
compiled shape:

```js
seneca.add(
  'role:shop,cmd:price',
  { item: String, quantity: seneca.valid.Default(1) },
  function price(msg, reply) { ... }
)
```

```markdown
#### Parameters

* __item__ : _string_
* __quantity__ : _number_ (optional, default: `1`)
```

Scalar values in a pattern are matching values, not rules, so use a
type constructor (`String`, `Number`) or a Gubu builder
(`seneca.valid.Default`, `seneca.valid.Required`, `seneca.valid.Skip`).
When a pattern has Gubu rules, they are rendered instead of any
`validate` rules of the doc definition.
