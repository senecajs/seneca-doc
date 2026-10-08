# Options reference

Options of the `@seneca/doc` plugin, set with
`seneca.use('@seneca/doc', { ... })` or `options.plugin.doc`.

| Option | Type | Default | Effect |
| ------ | ---- | ------- | ------ |
| `generating` | boolean | `false` | Exported as `doc/generating`. The `seneca-doc` tool loads the plugin with `generating: true`, so plugins can detect that documentation is being generated (see [Run the generator](../how-to/run-the-generator.md#4-detect-generation-inside-the-plugin)). |
| `test` | boolean | `false` | Not read by the plugin. Kept so that existing configurations remain valid. |

Options are validated against these defaults by Seneca. Seneca 4, and
Seneca 3 with Gubu option validation (`legacy: false` or
`legacy: { options: false }`), reject an unknown option with an
`invalid_plugin_option` error when the plugin loads; the default Joi
option validation of Seneca 3 accepts it. Seneca adds the plugin's
`errors` map to the resolved options
(`seneca.find_plugin('doc').options.errors`); it is not an option to
set.
