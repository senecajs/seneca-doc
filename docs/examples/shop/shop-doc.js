// Documentation of the shop plugin messages, keyed by action function name.
// The function form receives the Seneca instance and the Joi copy used by
// @seneca/doc, so this file needs no dependency of its own.
module.exports = function (seneca, { Joi }) {
  return {
    messages: {
      price: {
        desc: 'Calculate the gross price of a quantity of an item.',
        examples: {
          'item:apple,quantity:2': 'Price of two apples.'
        },
        reply_desc: {
          price: 'gross price',
          currency: 'currency code from the plugin options'
        }
      },

      stock: {
        desc: 'Report the stock level of an item.',
        validate: {
          item: Joi.string()
            .required()
            .description('Item identifier.'),
          warehouse: Joi.string()
            .default('main')
            .description('Warehouse name.')
        },
        reply_desc: {
          item: 'item identifier',
          count: 'units in stock',
          warehouse: 'warehouse name'
        }
      },

      help: {
        // Hand written documentation replaces the generated description.
        path: 'help.md'
      }
    },

    // Files injected between <!--START:SECTION:name--> and <!--END:SECTION:name-->.
    sections: {
      usage: { path: 'usage.md' }
    }
  }
}
