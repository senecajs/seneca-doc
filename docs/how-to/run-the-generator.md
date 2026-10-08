# Run the generator

How to generate the README sections of a plugin with the `seneca-doc`
command line tool, including plugins that depend on other plugins.
The flags are listed in the [Command line reference](../reference/command-line.md).

## 1. Prepare the project

* `package.json` has `main` pointing at the plugin module.
* `seneca` is installed in the project (`@seneca/doc` declares it as a
  peer dependency and uses the project's copy).
* `@seneca/doc` is a development dependency, with a script:

```json
{
  "scripts": {
    "doc": "seneca-doc"
  }
}
```

* `README.md` contains the marker pairs you want filled (see
  [README markers](../reference/readme-markers.md)):

```markdown
<!--START:options-->
<!--END:options-->

<!--START:action-list-->
<!--END:action-list-->

<!--START:action-desc-->
<!--END:action-desc-->
```

## 2. Run it

```sh
npm run doc
```

The tool loads the plugin named by `main` into a new Seneca instance,
without running the plugin's init action, and rewrites the text between
the markers. It prints nothing and exits with code 0 when all goes
well. Commit the generated README. Running it before each release keeps
the README current; this package's own `repo-publish` script runs
`npm run doc` before publishing.

## 3. Load the plugins yours depends on

A plugin that calls `this.depends('entity')`, or whose definition
function uses another plugin, cannot be defined alone. Pass each
dependency with `-p`, as the fully qualified module name installed in
`node_modules`:

```sh
seneca-doc -p seneca-entity -p @seneca/graph
```

```json
{
  "scripts": {
    "doc": "seneca-doc -p seneca-entity"
  }
}
```

The dependencies are loaded, in the given order, before your plugin.
Their init actions run normally; only the plugin being documented has
its init action skipped. Their actions are not included in the
generated sections.

## 4. Detect generation inside the plugin

If the plugin's definition function does something that cannot work
while generating documentation (for example it requires a service to
be reachable), check the `doc/generating` export, which is `true` only
when the tool runs:

```js
function shop(options) {
  const seneca = this

  if (!seneca.export('doc/generating')) {
    // connect to external services
  }
  ...
}
```

## 5. Order the properties of rendered patterns

Patterns are rendered with the top level properties `role` and `sys`
first, then the others alphabetically. Add your own top level names
with `-t`:

```sh
seneca-doc -t aim,on
```

renders the pattern `aim:shop,cmd:add,on:order` as
`aim:shop,on:order,cmd:add` (without `-t` it is rendered
alphabetically, `aim:shop,cmd:add,on:order`).

## 6. Debug a run

The Seneca instance of the tool is quiet. Set `SENECA_DOC_VERBOSE=1` to
see its logs:

```sh
SENECA_DOC_VERBOSE=1 npm run doc
```

Seneca errors (for example a plugin that fails to define) are printed
to the console in any case and make the command exit with a non-zero
code, without changing the README. An invalid doc definition throws a
validation error that names the message and the offending property
(see [Errors](../reference/errors.md) and
[Exit codes](../reference/command-line.md#exit-codes)).
