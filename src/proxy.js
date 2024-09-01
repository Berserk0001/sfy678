"use strict";
/*
 * proxy.js
 * The bandwidth hero proxy handler.
 * proxy(httpRequest, httpResponse);
 */
const undici = require("undici");
const pick = require("lodash").pick;
const shouldCompress = require("./shouldCompress");
const redirect = require("./redirect");
const compress = require("./compress");
const copyHeaders = require("./copyHeaders");

async function proxy(req, reply) {
  if (
    req.headers["via"] == "1.1 bandwidth-hero" &&
    ["127.0.0.1", "::1"].includes(req.headers["x-forwarded-for"] || req.ip)
  ) return redirect(req, reply);

  try {
    let origin = await undici.request(req.params.url, {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer", "range"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      maxRedirections: 4,
    });

    _onRequestResponse(origin, req, reply);
  } catch (err) {
    _onRequestError(req, reply, err);
  }
}

function _onRequestError(req, reply, err) {
  if (reply.sent) return; // Prevent sending the reply if already sent

  if (err.code === "ERR_INVALID_URL") return reply.status(400).send("Invalid URL");

  redirect(req, reply);
  console.error(err);
}

function _onRequestResponse(origin, req, reply) {
  if (reply.sent) return; // Prevent sending the reply if already sent

  if (origin.statusCode >= 400) return redirect(req, reply);

  if (origin.statusCode >= 300 && origin.headers.location) return redirect(req, reply);

  copyHeaders(origin, reply);

  reply
    .header("content-encoding", "identity")
    .header("Access-Control-Allow-Origin", "*")
    .header("Cross-Origin-Resource-Policy", "cross-origin")
    .header("Cross-Origin-Embedder-Policy", "unsafe-none");

  req.params.originType = origin.headers["content-type"] || "";
  req.params.originSize = origin.headers["content-length"] || "0";

  origin.body.on('error', () => {
    if (!reply.sent) {
      reply.raw.destroy();
    }
  });

  if (shouldCompress(req)) {
    return compress(req, reply, origin);
  } else {
    reply.header("x-proxy-bypass", 1);

    for (const headerName of ["accept-ranges", "content-type", "content-length", "content-range"]) {
      if (headerName in origin.headers) reply.header(headerName, origin.headers[headerName]);
    }

    return reply.send(origin.body);
  }
}

module.exports = proxy;
