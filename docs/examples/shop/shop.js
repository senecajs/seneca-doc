// An example Seneca plugin: a tiny shop with three messages.
module.exports = shop

shop.defaults = {
  currency: 'EUR',
  tax: { rate: 0.2 }
}

shop.errors = {
  no_item: 'Item <%=id%> not found.'
}

function shop(options) {
  const seneca = this

  // Runs when the plugin loads normally, but not when seneca-doc
  // generates documentation.
  seneca.init(function (done) {
    console.log('shop: init (connect to databases here)')
    done()
  })

  // Rules in the pattern are Gubu shapes; seneca-doc renders them.
  // (A plain number would be a pattern value, so Default marks a rule.)
  seneca.add(
    'role:shop,cmd:price',
    { item: String, quantity: seneca.valid.Default(1) },
    function price(msg, reply) {
      const net = msg.quantity * 10
      reply({
        price: net * (1 + options.tax.rate),
        currency: options.currency
      })
    }
  )

  seneca.add('role:shop,cmd:stock', function stock(msg, reply) {
    reply({ item: msg.item, count: 1, warehouse: msg.warehouse || 'main' })
  })

  seneca.add('role:shop,cmd:help', function help(msg, reply) {
    reply({ topics: ['price', 'stock'] })
  })
}
