const merge = require('webpack-merge');

const dev = require('./dev.js');
const prod = require('./prod.js');
const isProd = process.env.NODE_ENV === 'production';

module.exports = isProd ? merge(dev, prod) : dev;
