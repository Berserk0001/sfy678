"use strict";

const DEFAULT_QUALITY = 40;

function params(request, reply, next) {
  let url = request.query.url;
  if (!url) {
    return reply.send("bandwidth-hero-proxy");
  }

  request.body = request.body || {}; // Ensure body exists
  request.body.url = decodeURIComponent(url);
  request.body.webp = !request.query.jpeg;
  request.body.grayscale = request.query.bw != 0;
  request.body.quality = parseInt(request.query.l, 10) || DEFAULT_QUALITY;

  next();
}

module.exports = params;
