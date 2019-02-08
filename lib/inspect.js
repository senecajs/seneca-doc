
const Seneca = require('seneca')

module.exports = function(local_folder, local_package) {
  // load .seneca-doc.js from local folder

  const local_plugin_path = Path.resolve(local_folder, local_package.main)
  
  const seneca = Seneca()
  seneca.use(local_plugin_path)

  const out = {}
  out.patterns = seneca.list()

  return out
}
