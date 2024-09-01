const DEFAULT_QUALITY = 1;

async function params(request, reply) {
    let url = request.query.url;
    if (Array.isArray(url)) url = url.join('&url=');
    if (!url) {
        reply.send('bandwidth-hero-proxy');
        return;
    }

    url = url.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');
    request.params.url = url;
    request.params.webp = !request.query.jpeg;
    request.params.grayscale = request.query.bw != 0;
    request.params.quality = parseInt(request.query.l, 10) || DEFAULT_QUALITY;
}

module.exports = params;
