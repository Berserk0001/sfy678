#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.get('/', async (req, reply) => {
  try {
    await params(req, reply);
    if (!reply.sent) {
      return proxy(req, reply);
    }
  } catch (err) {
    fastify.log.error(err);
    if (!reply.sent) {
      reply.status(500).send('Internal Server Error');
    }
  }
});

fastify.get('/favicon.ico', (req, reply) => {
  if (!reply.sent) {
    reply.status(204).send();
  }
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
