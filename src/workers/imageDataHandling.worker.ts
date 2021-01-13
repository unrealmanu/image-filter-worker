import { WorkerMessageEventImageHandling, WorkerMessageEventDataImageDataHandling } from '../models/WorkerInterface';

const ctx: Worker = self as any;

ctx.onmessage = async (event: WorkerMessageEventImageHandling) => {
    if (typeof event.data.action !== 'string') {
        throw `image worker need action`;
    }

    if (typeof event.data.imageData === 'undefined') {
        throw `image worker need imageData`;
    }

    const message: WorkerMessageEventDataImageDataHandling = event.data;

    switch (message.action) {
        case '/filter/sepia/':
            const origImageData = message.imageData;
            const imageData = new ImageData(
                new Uint8ClampedArray(origImageData.data),
                origImageData.width,
                origImageData.height
            );

            // EDIT RGBA OF NEW IMAGE DATA OBJECT
            const data = imageData.data;
            for (var i = 0; i < data.length; i += 4) {
                let red = data[i],
                    green = data[i + 1],
                    blue = data[i + 2];

                data[i] = Math.min(Math.round(0.393 * red + 0.769 * green + 0.189 * blue), 255);
                data[i + 1] = Math.min(Math.round(0.349 * red + 0.686 * green + 0.168 * blue), 255);
                data[i + 2] = Math.min(Math.round(0.272 * red + 0.534 * green + 0.131 * blue), 255);
            }

            const response: WorkerMessageEventDataImageDataHandling = {
                imageData: imageData,
                action: event.data.action,
            };
            ctx.postMessage(response);
            break;
        default:
            throw `image worker topic unsuported ${event.data.action}`;
    }
};
