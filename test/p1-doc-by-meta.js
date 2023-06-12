const Joi = require('@hapi/joi')

module.exports = {
  messages: {
    a1: {
      desc: 'a1',
      validate: {
        x: Joi.string()
      }
    }
  }
}
