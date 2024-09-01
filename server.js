#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Register the params middleware as a hook
fastify.addHook('preHandler', params);

// Define the main route
fastify.get('/', proxy);

// Handle the favicon request
fastify.get('/favicon.ico', (request, reply) => reply.status(204).send());

// Start the server
fastify.listen({ port: PORT }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
});
