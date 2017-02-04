const hapiJwt = require('hapi-auth-jwt2')
const secret = require('../../config').get('/secret')
const models = require('../models')
const moment = require('moment')

const register = function register (server, options, next) {
  server.register(hapiJwt)

  const validateFunc = async (decoded, request, callback) => {
    let {userId, expire} = decoded
    let user = await models.User.findOne({where: {id: userId}})
    if(!user){
      return callback('cannot found user', false)
    }

    if(moment(expire, 'YYYY-MM-DD HH:mm').isBefore(moment())){
      return callback('expired token', false)
    }

    return callback(null, true)
  }

  server.auth.strategy('jwt', 'jwt',
    {
      key: secret,
      validateFunc: validateFunc,
      headerKey: 'token'
    })

  next()
}

register.attributes = {
  name: 'jwt',
}

module.exports = register
