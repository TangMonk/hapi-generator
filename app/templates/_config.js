'use strict'

const Confidence = require('confidence')


const default_criteria = {
  env: process.env.NODE_ENV
}


const config = {
  $meta: 'This file configures the plot device.',
  projectName: 'music',
  port: {
    web: {
      $filter: 'env',
      test: 9090,
      production: 3000,
      $default: 8080
    }
  },
  secret: {
    production: '<%= secret %>',
    $default: '<%= secret %>',
    '$filter': 'env',
  },
  database: {
    production: {
      database: 'music_prod',
      username: 'root',
      password: 'root',
      options: {
        host: 'localhost',
        dialect: 'mysql'
      }
    },
    test: {
      database: 'music_test',
      username: 'root',
      password: 'root',
      options: {
        host: 'localhost',
        dialect: 'mysql'
      }
    },
    '$filter': 'env',
    '$default': {
      database: 'music_dev',
      username: 'tangmonk',
      password: '',
      options: {
        host: 'localhost',
        dialect: 'postgres'
      }
    },
  }
}


const store = new Confidence.Store(config)


exports.get = function (key, criteria = default_criteria) {

  return store.get(key, criteria)
}


exports.meta = function (key, criteria = default_criteria) {

  return store.meta(key, criteria)
}
