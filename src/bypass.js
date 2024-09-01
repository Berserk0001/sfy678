function bypass(request, reply, buffer) {
    reply
        .header('x-proxy-bypass', 1)
        .header('content-length', buffer.length)
        .status(200)
        .send(buffer);
}

module.exports = bypass;
