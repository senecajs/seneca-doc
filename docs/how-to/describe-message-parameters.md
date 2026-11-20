# Describe message parameters

How to document the parameters of a message in a doc definition, how
they are rendered, and how to have them enforced.

## 1. Add `validate` rules

In the doc definition, `validate` is an object whose keys are message
properties and whose values are rules. Write the rules with the Shape
builders of Seneca (`seneca.valid`). The function form of the doc file
receives them as `valid`, so the file needs no dependency of its own:

```js
module.exports = function (seneca, { valid }) {
  return {
    messages: {
      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: valid.Required(String).Describe('Item identifier.'),
          warehouse: valid.Default('main').Describe('Warehouse name.')
        }
      }
    }
  }
}
```

A doc file that is a plain object can use `require('seneca').valid`.

## 2. See how they render

The generator lists each rule under `#### Parameters` with its type in
italics, whether it is optional with its default value, and the
description:

```markdown
#### Parameters

* __item__ : _string_ : Item identifier.
* __warehouse__ : _string_ (optional, default: `main`) : Warehouse name.
```

Joi schemas are rendered too, with their type, `required` or the
default value, and their `description`, when the plugin brings its own
Joi: `@seneca/doc` does not depend on Joi. A rule value that is neither
a Shape rule nor a Joi schema is rendered with `util.inspect`.

## 3. Rules in a doc definition are not enforced

`@seneca/doc` merges the `validate` rules into `actdef.rules` of the
action, where `actdef` is the object returned by `seneca.find(pattern)`.
It does not validate messages itself, and Seneca does not enforce rules
added after the action was added: a message with `item: 1` still
reaches the action.

## 4. Put enforced rules in the pattern

When the rules must be enforced, put them in the pattern. Seneca
compiles them into a shape and enforces it (an invalid message gets an
`act_invalid_msg` error), and `@seneca/doc` renders them from the
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
type constructor (`String`, `Number`) or a Shape builder
(`seneca.valid.Default`, `seneca.valid.Required`, `seneca.valid.Skip`).
Add `.Describe('...')` to a builder to render a description. When a
pattern has rules, they are rendered instead of any `validate` rules of
the doc definition.
