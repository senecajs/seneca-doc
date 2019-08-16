// const Joi = require('@hapi/joi')

module.exports = {
  describe_pin: {
    desc:
      'Provide introspection data for actions matching a _pin_ (a sub pattern).',
    examples: {
      'pin:"a:1,b:2"': 'Describe actions matching at least `a:1,b:2`.'
    },
    reply_desc: {
      pin: 'pin parameter',
      actions: ['{ Seneca action definition }']
    }
  }
}
