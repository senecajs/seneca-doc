const { valid } = require('seneca')

module.exports = {
  messages: {
    a1: {
      desc: 'a1',
      validate: {
        x: valid.Required(String)
      }
    }
  }
}
