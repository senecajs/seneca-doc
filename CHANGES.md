## 8.1.0 2026-10-07

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
