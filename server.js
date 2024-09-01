#!/usr/bin/env node
'use strict';
const fastify = require('fastify')();
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.register(require('@fastify/formbody'))

fastify.get('/', { preHandler: params }, proxy);
fastify.get('/favicon.ico', (req, res) => res.status(204).send());

// Start the server
  fastify.listen({host: '0.0.0.0' , port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});
