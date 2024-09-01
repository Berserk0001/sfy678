"use strict";

const undici = require("undici");
const pick = require("lodash").pick;
const shouldCompress = require("./shouldCompress");
const redirect = require("./redirect");
const compress = require("./compress");
const copyHeaders = require("./copyHeaders");

async function proxy(req, reply) {
  if (req.headers["via"] == "1.1 bandwidth-hero" && 
      ["127.0.0.1", "::1"].includes(req.headers["x-forwarded-for"] || req.ip)) {
    return redirect(req, reply);
  }

  try {
    let origin = await undici.request(req.body.url, {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer", "range"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      maxRedirections: 4
    });

    await _onRequestResponse(origin, req, reply);
  } catch (err) {
    _onRequestError(req, reply, err);
  }
}

function _onRequestError(req, reply, err) {
  if (err.code === "ERR_INVALID_URL") {
    return reply.code(400).send({ error: "Invalid URL" });
  }
  redirect(req, reply);
  console.error(err);
}

async function _onRequestResponse(origin, req, reply) {
  if (origin.statusCode >= 400) {
    return redirect(req, reply);
  }

  if (origin.statusCode >= 300 && origin.headers.location) {
    return redirect(req, reply);
  }

  copyHeaders(origin, reply);
  reply.header('content-encoding', 'identity');
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Cross-Origin-Resource-Policy", "cross-origin");
  reply.header("Cross-Origin-Embedder-Policy", "unsafe-none");

  req.body.originType = origin.headers["content-type"] || "";
  req.body.originSize = origin.headers["content-length"] || "0";

  origin.body.on('error', () => req.destroy());

  if (shouldCompress(req)) {
    return compress(req, reply, origin.body);
  } else {
    reply.header("x-proxy-bypass", "1");
    for (const headerName of ["accept-ranges", "content-type", "content-length", "content-range"]) {
      if (origin.headers[headerName]) {
        reply.header(headerName, origin.headers[headerName]);
      }
    }
    reply.send(origin.body); // Fastify handles streams differently, directly send the stream.
  }
}

module.exports = proxy;
