"use strict";

function redirect(req, reply) {
  // Check if the response has not already been sent
  if (!reply.sent) {
    reply.header('location', encodeURI(req.body.url));
    reply.removeHeader('content-length'); // Reset content length as per Fastify conventions
    reply.code(302).send();
  }
}

module.exports = redirect;
