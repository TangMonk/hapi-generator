'use strict'

const Confidence = require('confidence')


const default_criteria = {
  env: process.env.NODE_ENV
}


const config = {
  $meta: 'This file configures the plot device.',
  projectName: '<%= appName %>',
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
  }
}


const store = new Confidence.Store(config)


exports.get = function (key, criteria = default_criteria) {

  return store.get(key, criteria)
}


exports.meta = function (key, criteria = default_criteria) {

  return store.meta(key, criteria)
}
