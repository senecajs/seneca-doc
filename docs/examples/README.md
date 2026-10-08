# Examples

The example project that accompanies the
[Getting started](../tutorials/getting-started.md) tutorial is in
`shop/`:

| File | Purpose |
| ---- | ------- |
| `shop/package.json` | `main` names the plugin module; the `doc` script runs `seneca-doc`. |
| `shop/shop.js` | The plugin: three messages, `defaults`, an init action. |
| `shop/shop-doc.js` | The doc definition (function form), including `validate` rules, a `path` and a section. |
| `shop/help.md`, `shop/usage.md` | Hand written text inserted by `path` and by `sections`. |
| `shop/README.md` | The README with empty markers. The tool fills them in; `git checkout README.md` in that folder restores the file. The generated result is shown in the [README markers reference](../reference/readme-markers.md#example). |
| `shop/describe.js` | Queries the documentation at runtime. |

The files require `@seneca/doc` from this repository
(`require('../../..')`); in your own project use
`seneca.use('@seneca/doc')`. `seneca` resolves to the development
dependency of this repository.

Run them from the example folder of a checkout, after `npm install`,
with Node.js 22 or later:

```sh
cd docs/examples/shop
node describe.js
node ../../../bin/seneca-doc-exec.js
```

Run `describe.js` from its own folder: it loads `./shop` by a relative
path, and for such plugins the doc file is looked up in the current
directory (see [Write a doc file](../how-to/write-a-doc-file.md)). In a
project that installed `@seneca/doc`, the last command is `npm run doc`
(or `npx seneca-doc`).
