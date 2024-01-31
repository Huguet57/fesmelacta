export const modelUrls = {
    'base':         'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/ggml-model-whisper-base-q5_1.bin',
    'small':        'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-small-q5.bin',
    'medium':       'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-medium-q5.bin',
    'base-gpu':     'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/gpu-models/base-q8g16.bin',
    'small-gpu':    'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/gpu-models/small-q8g16.bin',
    'medium-gpu':   'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/gpu-models/medium-q8g16.bin',
};

export const tokenizerUrls = {
    'gpu': 'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/gpu-models/tokenizer.json',
};

export const modelSizes = {
    'base':     57,
    'small':    190,
    'medium':   514,

    'base-gpu': 92,
    'small-gpu': 299,
    'medium-gpu': 927,
};

export const fetchTokenizer = (tokenizerName, onProgress) => {
    return new Promise(async (resolve, reject) => {
        const modelUrl = tokenizerUrls[tokenizerName];

        const response = await fetch(
            modelUrl,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            }
        );

        if (!response.ok) {
            reject(new Error('Failed to fetch model from ' + modelUrl));
            return;
        }

        const contentLength = response.headers.get('content-length');
        let receivedLength = 0;
        const chunks = [];
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            if (contentLength && onProgress) {
                const progress = receivedLength / contentLength * 100;
                onProgress(progress);
            }
        }

        const chunksAll = new Uint8Array(receivedLength);
        let position = 0;

        chunks.forEach(chunk => {
            chunksAll.set(chunk, position);
            position += chunk.length;
        });

        resolve(chunksAll);
    });
}

export const fetchModel = (modelName, onProgress) => {
    return new Promise(async (resolve, reject) => {
        const modelUrl = modelUrls[modelName];

        const response = await fetch(
            modelUrl,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            }
        );

        if (!response.ok) {
            reject(new Error('Failed to fetch model from ' + modelUrl));
            return;
        }

        const contentLength = response.headers.get('content-length');
        let receivedLength = 0;
        const chunks = [];
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            if (contentLength && onProgress) {
                const progress = receivedLength / contentLength * 100;
                onProgress(progress);
            }
        }

        const chunksAll = new Uint8Array(receivedLength);
        let position = 0;

        chunks.forEach(chunk => {
            chunksAll.set(chunk, position);
            position += chunk.length;
        });

        resolve(chunksAll);
    });
}