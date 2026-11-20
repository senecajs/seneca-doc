# Changes

## 9.0.0 2026-11-20

Seneca 4 release. Seneca 3 users stay on `@seneca/doc` 8.0.x. Version
8.1.0 was prepared but never published; its changes, listed below, are
part of this release, as amended here.

* Seneca 4: the peer dependency is `seneca` `^4.0.0`, and Seneca 3 is no
  longer supported.
* Node.js 24 or later (`engines.node` `>=24`).
* `@hapi/joi` is no longer a dependency (B2). Doc definitions are
  validated with the Shape builders of Seneca (`seneca.valid`); their
  error messages are Shape messages after the same `invalid` and
  `action <pattern> (<name>) documentation invalid` prefixes.
* Breaking: a doc definition in function form receives `{ valid }`, the
  Shape builders of Seneca, instead of `{ Joi }`. Reading `Joi` from it
  throws an error that says so. Write `validate` rules with `valid`,
  for example `valid.Required(String).Describe('Item identifier.')`, or
  require Joi from your own dependencies.
* The `validate` annotations of `sys:doc,describe:plugin` and
  `sys:doc,describe:pin` are Shape rules instead of Joi schemas.
* Rendering recognises Shape 11 shapes and nodes (the `shape$` marker)
  instead of Gubu ones (B1), so the Options section and the Parameters
  of actions with pattern rules are generated on Seneca 4.0.0 again.
  Descriptions set with `.Describe('...')` are rendered after the type,
  for options and for parameters. Joi schemas in `validate` rules are
  still rendered when the plugin brings its own Joi.
* Breaking: the options shape is built only from the plugin `defaults`
  (a plain object, a shape, or a function of `{ valid }`); the Seneca 3
  plugin record fields `options_shape` and the Joi `options_schema` are
  no longer read, and the renderer no longer has a Joi options walker
  (`intern.walk_joi_options`). `intern.walk_gubu_options` and
  `intern.gubuflags` of `lib/render.js` are renamed
  `walk_shape_options` and `shapeflags`.
* The renderer reads `actdef.shape` instead of the deprecated
  `actdef.gubu` (D2, `SENECA_DEP_ACTDEF_GUBU`), and the tests use
  `Seneca.valid` instead of `seneca.util.Gubu` (D2,
  `SENECA_DEP_UTIL_GUBU`). The test run prints no `SENECA_DEP_*`
  warning.
* New module `lib/kinds.js` recognises shapes, shape nodes and Joi
  schemas by their markers.
* The `seneca-doc` tool awaits `seneca.ready()`.
* Tests: the `action-validation` test, which loaded seneca-joi to
  enforce the Joi rules of doc definitions, is removed with the
  seneca-joi development dependency. A new test checks that `validate`
  rules are documentation only; others cover the `{ valid }` utilities,
  doc definition validation and Joi rendering without Joi.
* Package: `publishConfig.access` is `public`; `package-lock.json` is no
  longer committed.
* Documentation: the Joi how-to is replaced by
  [Describe message parameters](docs/how-to/describe-message-parameters.md),
  and the tutorial, the example, the reference pages, the migration
  guide and the explanation describe Seneca 4 only.

### Prepared as 8.1.0 (2026-10-07, not published)

Where these items mention Seneca 3, the Seneca 4 prerelease, Node.js
22, `@hapi/joi` or seneca-joi, the list above applies instead.

* Seneca 4 prerelease support (4.0.0-rc5 and later), while keeping Seneca
  3 support. `seneca` is now a peer dependency (`>=3 || >=4.0.0-rc5`)
  instead of a dependency; the plugin and the `seneca-doc` tool run
  inside the Seneca installed in the project being documented, which
  `lib/inspect.js` and `lib/render.js` now resolve from that project
  (`lib/host-seneca.js`), also when `@seneca/doc` is linked.
* The plugin no longer reads `seneca.util.Joi`, which Seneca 4 does not
  provide; it uses its own `@hapi/joi` dependency everywhere.
* New option `generating` (default `false`), exported as `doc/generating`
  and set to `true` by the `seneca-doc` tool. Previously the tool passed
  `generating: true` only when Seneca used Joi option validation, which
  never happened because it creates its instance with `legacy: false`,
  so the export was `undefined`.
* `sys:doc,describe:plugin` replies with a new `options_shape` property:
  the Gubu shape of the plugin options, built from the plugin `defaults`
  when Seneca does not record it (Seneca 4, and Seneca 3 with its default
  Joi option validation). The Options section is therefore generated on
  Seneca 4. Nested options are listed as `parent.child` with their
  default value (strings, numbers and booleans) or `required`; directives
  such as `init$` are left out.
* `sys:doc,describe:plugin` matches plugins whose names contain dashes
  (previously the name was only compared after replacing dashes with
  underscores, so no actions were found).
* The `seneca-doc` tool skips the init action of the local plugin by
  setting `init$` on the resolved options from the plugin loading
  pipeline, because Seneca 4 option validation rejects the `init$`
  directive passed to `use()` for plugins that declare `defaults`. It
  waits for `ready()` with the callback form, which works on 4.0.0-rc5
  and on Seneca 3 without seneca-promisify, so `seneca-promisify` is no
  longer a dependency.
* The `seneca-doc` tool exits with code 1 when Seneca reports an error
  (for example a plugin that fails to define). With Seneca 4.0.0-rc5,
  which does not terminate on fatal errors, it previously exited with
  code 0 and left the README unchanged.
* `minimist`, used by the command line tool, is a declared dependency.
* Renderer fixes: a Joi options schema with keys no longer throws
  (`walk_options` typo); Joi parameters show `required` or their default
  instead of a quoted placeholder; an action documented with `path` ends
  with the same separator as the others; a blank line precedes the
  Parameters heading.
* Tests run on Node.js 24 and 22 with jest 29, against seneca
  4.0.0-rc5 (and the unreleased 4.0.0); they close every instance and no
  longer rewrite `test/test.md`. New tests cover doc files, `meta.doc`,
  definition function properties, errors, exports and rendering; the
  commented out validation test is restored, with seneca-joi as a
  development dependency. `seneca-plugin-validator`, which no test used,
  is removed.
* Documentation reorganized following Diátaxis: a README landing page and
  `docs/` with a tutorial (complete example in `docs/examples/shop`),
  how-to guides, reference pages and an explanation. The package now
  includes `docs/` and this change log.
* Repository URLs point at senecajs/seneca-doc. The GitHub Actions
  workflow patch in `.patches/` triggers the build on the `master` branch.
