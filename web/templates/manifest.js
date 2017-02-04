'use strict';

const Confidence = require('confidence');
const Config = require('./config');
const heredoc = require('heredoc')

const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web']
    }],
    registrations: [
        {
            plugin: 'vision'
        },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: { jade: 'jade' },
                    path: './server/web'
                }
            }
        },
        {
            plugin: 'inert'
        },
        {
            plugin: './server/web/index'
        },

        {
            plugin: {
              register: 'hapi-swagger',
              options: {
                info: {
                  title: '开发文档',
                  description: heredoc.strip(() => { /*
                    ## Document
                  */})
                },
                tags: [
                  {
                    name: 'user',
                    description: '用户操作'
                  },
                ],
                basePath: '/api',
                pathPrefixSize: 2,
              }
            }
        },
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
