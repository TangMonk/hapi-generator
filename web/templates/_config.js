'use strict';

const Confidence = require('confidence');


const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This file configures the plot device.',
    projectName: '<%= appName %>',
    port: {
        web: {
            $filter: 'env',
            test: 9090,
            $default: 8080
        }
    },
    production: {
        database: 'music_prod',
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
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
