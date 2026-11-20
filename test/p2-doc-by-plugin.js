module.exports = function(seneca, docutil) {
  var valid = docutil.valid

  return {
    messages: {
      a1: {
        desc: 'a1',
        validate: {
          x: valid.Required(String)
        }
      }
    }
  }
}
