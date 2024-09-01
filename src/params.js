"use strict";
const DEFAULT_QUALITY = 40;

async function params(req, reply) {
  let url = req.query.url;
  if (!url) {
    if (!reply.sent) reply.send('bandwidth-hero-proxy');
    return;
  }

  req.params.url = decodeURIComponent(url);
  req.params.webp = !req.query.jpeg;
  req.params.grayscale = req.query.bw != 0;
  req.params.quality = parseInt(req.query.l, 10) || DEFAULT_QUALITY;
}

module.exports = params;
