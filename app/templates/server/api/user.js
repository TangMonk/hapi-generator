const models = require('../models')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const moment = require('moment')
const bcrypt = require('bcrypt')
const config = require('../../config')

const users = async (request, reply) => {
  const users = await models.User.findAll()
  reply(users)
}

const login = async (request, reply) => {
  let user = await models.User.findOne({where: {phone: request.payload.phone}})
  if(!user) {
    return reply({message: '用户不存在'}).code(400)
  }
  bcrypt.compare(request.payload.password, user.password_hash, (error) => {
    if(error) { return reply({message: '密码错误'}).code(400) }
    let token = jwt.sign({
      userId: user.id,
      expire: moment().add(30, 'days').format('YYYY-MM-DD HH:mm')
    }, config.get('/secret'))

    reply({token: token, user: user})
  })
}

const signUp = async (request, reply) => {
  let user = await models.User.findOne({where: {phone: request.payload.phone}})
  if(user) {
    return reply({message: '用户已经存在'}).code(400)
  }
  let salt = bcrypt.genSaltSync()
  let password_hash = bcrypt.hashSync(request.payload.password, salt)
  user = await models.User.create({phone: request.payload.phone, password_hash: password_hash})

  let token = jwt.sign({
    userId: user.id,
    expire: moment().add(30, 'days').format('YYYY-MM-DD HH:mm')
  }, config.get('/secret'))

  reply({token: token, user: user})
}

module.exports = (server) => {
  server.route({
    method: 'POST',
    path: '/user/list',
    config: {
      tags: ['api', 'user'],
      description: '用户列表',
      auth: 'jwt',
    },
    handler: users
  })

  server.route({
    method: 'POST',
    path: '/user/login',
    config: {
      tags: ['api', 'user'],
      description: '用户登陆',
      validate: {
        payload: {
          phone: Joi.string().required(),
          password: Joi.string().required(),
        }
      }
    },
    handler: login
  })

  server.route({
    method: 'POST',
    path: '/user/signUp',
    config: {
      tags: ['api', 'user'],
      description: '用户注册',
      validate: {
        payload: {
          phone: Joi.string().required(),
          password: Joi.string().required(),
        }
      }
    },
    handler: signUp
  })
}
