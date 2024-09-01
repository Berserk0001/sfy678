const sharp = require('sharp');
const redirect = require('./redirect');

async function compress(request, reply, input) {
    const format = request.params.webp ? 'webp' : 'jpeg';
    try {
        const output = await sharp(input)
            .grayscale(request.params.grayscale)
            .toFormat(format, {
                quality: request.params.quality,
                progressive: true,
                optimizeScans: true
            })
            .toBuffer();

        reply
            .header('content-type', `image/${format}`)
            .header('content-length', output.length)
            .header('x-original-size', request.params.originSize)
            .header('x-bytes-saved', request.params.originSize - output.length)
            .status(200)
            .send(output);
    } catch (err) {
        redirect(request, reply);
    }
}

module.exports = compress;
