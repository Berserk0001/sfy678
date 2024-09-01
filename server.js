#!/usr/bin/env node
'use strict';
const fastify = require('fastify')();
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.register(require('@fastify/formbody'))

fastify.get('/', { preHandler: params }, proxy);
fastify.get('/favicon.ico', (req, res) => res.status(204).send());

fastify.listen({ port: PORT }, (err, address) => {
  if (err) throw err
  console.log(`Server listening at ${address}`)
})
