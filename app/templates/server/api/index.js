'use strict'

exports.register = function(server, options, next) {
  require('./user')(server)

  next()
}


exports.register.attributes = {
  name: 'api'
}
