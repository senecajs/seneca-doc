const Joi = require('@hapi/joi')

module.exports = {
  a1: {
    desc: 'a1',
    validate: {
      x: Joi.string()
    }
  }
}
