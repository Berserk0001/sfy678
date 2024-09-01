"use strict";
/*
 * compress.js
 * A module that compress a image.
 * compress(httpRequest, httpResponse, ReadableStream);
 */
const sharp = require('sharp')
const redirect = require('./redirect')

const sharpStream = _ => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

async function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg'

  try {
      const output = await input.body.pipe(sharpStream()
          .grayscale(req.params.grayscale)
          .toFormat(format, {
              quality: req.params.quality,
              progressive: true,
              optimizeScans: true
          })
          .toBuffer())

      const info = { size: output.length }; // Get size from buffer length

      _sendResponse(null, output, info, format, req, res);
  } catch (err) {
      _sendResponse(err, null, null, format, req, res);
  }
}

function _sendResponse(err, output, info, format, req, res) {
  if (err || !info) return redirect(req, res);

  res.header('content-type', 'image/' + format);
  res.header('content-length', info.size);
  res.header('x-original-size', req.params.originSize);
  res.header('x-bytes-saved', req.params.originSize - info.size);
  res.status(200).send(output);
}

module.exports = compress;
