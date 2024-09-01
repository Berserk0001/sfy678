#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.get('/', async (req, reply) => {
  await params(req, reply);
  return proxy(req, reply);
});

fastify.get('/favicon.ico', (req, reply) => {
  reply.status(204).send();
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
