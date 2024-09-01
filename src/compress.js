"use strict";

const sharp = require('sharp');

const sharpStream = () => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

async function compress(req, reply, input) {
  const format = req.body.webp ? 'webp' : 'jpeg';

  try {
    const result = await input.pipe(sharpStream()
      .grayscale(req.body.grayscale)
      .toFormat(format, {
        quality: req.body.quality,
        progressive: true,
        optimizeScans: true
      })
    ).toBuffer();

    reply.headers({
      'content-type': `image/${format}`,
      'content-length': result.length,
      'x-original-size': req.body.originSize,
      'x-bytes-saved': req.body.originSize - result.length
    });
    reply.code(200).send(result);
  } catch (err) {
    console.error('Compression error:', err);
    redirect(req, reply);
  }
}

module.exports = compress;

// Assuming redirect.js needs a small adjustment for Fastify
const redirect = require('./redirect');
function _sendResponse(err, output, info, format, req, reply) {
  if (err || !info) return redirect(req, reply);

  // No need for direct manipulation of headers or status here,
  // as we're now using reply methods directly in the compress function.
}
