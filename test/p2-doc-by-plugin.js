module.exports = function(seneca, docutil) {
  var Joi = docutil.Joi

  return {
    messages: {
      a1: {
        desc: 'a1',
        validate: {
          x: Joi.string()
        }
      }
    }
  }
}
