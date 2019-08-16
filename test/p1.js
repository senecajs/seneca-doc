const Doc = require('./p1-doc-by-meta')

module.exports = function p1() {
  this.add('p:p1,a:1', function a1(m, r) {
    r({ y: m.x })
  })
  this.add('p:p1,a:2', function a2(m, r) {
    r({ y: m.x })
  })

  return {
    doc: Doc
  }
}
