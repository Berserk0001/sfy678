#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Register fastify-multipart for handling multipart/form-data
fastify.register(require('@fastify/multipart'), { 
  attachFieldsToBody: true 
});

// Route for processing images
fastify.get('/', async (request, reply) => {
  await params(request, reply);
  return proxy(request.raw, reply);
});

// Route for favicon
fastify.get('/favicon.ico', async (request, reply) => {
  reply.code(204).send();
});

// Start the server
const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
