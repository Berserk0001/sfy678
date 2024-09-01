"use strict";
/*
 * compress.js
 * A module that compresses an image.
 * compress(httpRequest, httpResponse, ReadableStream);
 */
const sharp = require('sharp');
const redirect = require('./redirect');

const sharpStream = () => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

function compress(req, reply, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  input.body
    .pipe(
      sharpStream()
        .grayscale(req.params.grayscale)
        .toFormat(format, {
          quality: req.params.quality,
          progressive: true,
          optimizeScans: true,
        })
    )
    .toBuffer((err, output, info) => {
      if (reply.sent) return; // Prevent sending the reply if already sent
      _sendResponse(err, output, info, format, req, reply);
    });

  input.body.on('error', () => {
    if (!reply.sent) {
      reply.raw.destroy();
    }
  });
}

function _sendResponse(err, output, info, format, req, reply) {
  if (err || !info) {
    if (!reply.sent) return redirect(req, reply);
  }

  if (!reply.sent) {
    reply
      .header('content-type', 'image/' + format)
      .header('content-length', info.size)
      .header('x-original-size', req.params.originSize)
      .header('x-bytes-saved', req.params.originSize - info.size)
      .status(200)
      .send(output);
  }
}

module.exports = compress;
