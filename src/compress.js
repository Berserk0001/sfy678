"use strict";
/*
 * compress.js
 * A module that compresses an image.
 */
const sharp = require('sharp');
const redirect = require('./redirect');
const { pipeline } = require('stream');
const { promisify } = require('util');

// Convert pipeline to promise-based function
const streamPipeline = promisify(pipeline);

const sharpStream = () => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

async function compress(req, reply, input) {
  try {
    // Create a sharp stream with the required transformations
    const transform = sharpStream()
      .grayscale(req.params.grayscale)
      .toFormat(req.params.webp ? 'webp' : 'jpeg', {
        quality: req.params.quality,
        progressive: true,
        optimizeScans: true,
      });

    // Use pipeline to handle stream and buffer conversion
    const outputBuffer = await streamPipeline(input, transform);

    const info = await transform.metadata(); // Get metadata after the transformation

    _sendResponse(null, outputBuffer, info, req.params.webp ? 'webp' : 'jpeg', req, reply);
  } catch (err) {
    _sendResponse(err, null, null, null, req, reply);
  }
}

function _sendResponse(err, output, info, format, req, reply) {
  if (err || !info) return redirect(req, reply);

  reply
    .header('content-type', 'image/' + format)
    .header('content-length', info.size)
    .header('x-original-size', req.params.originSize)
    .header('x-bytes-saved', req.params.originSize - info.size)
    .status(200)
    .send(output);
}

module.exports = compress;
