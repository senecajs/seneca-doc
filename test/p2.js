
module.exports = p2

module.exports.doc = require('./p2-doc-by-plugin')

function p2() {
  this.add('p:p2,a:1', function a1(m, r) {
    r({ y: m.x })
  })
  this.add('p:p2,a:2', function a2(m, r) {
    r({ y: m.x })
  })
}
