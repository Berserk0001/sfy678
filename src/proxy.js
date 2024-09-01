const fetch = require('node-fetch');
const pick = require('lodash.pick');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

async function proxy(request, reply) {
    try {
        const response = await fetch(request.params.url, {
            headers: {
                ...pick(request.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': 'Bandwidth-Hero Compressor',
                'x-forwarded-for': request.headers['x-forwarded-for'] || request.ip,
                via: '1.1 bandwidth-hero'
            },
        });

        if (!response.ok) {
            return redirect(request, reply);
        }

        request.params.originType = response.headers.get('content-type') || '';
        const buffer = await response.buffer();
        request.params.originSize = buffer.length;
        copyHeaders(response, reply);
        reply.header('content-encoding', 'identity');

        if (shouldCompress(request)) {
            compress(request, reply, buffer);
        } else {
            bypass(request, reply, buffer);
        }
    } catch (e) {
        console.log(e);
        redirect(request, reply);
    }
}

module.exports = proxy;
