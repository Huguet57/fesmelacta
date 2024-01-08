export const modelUrls = {
    'tiny':     'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/ggml-model-whisper-tiny-q5_1.bin',
    'base':     'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/ggml-model-whisper-base-q5_1.bin',
    'small':    'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-small-q5.bin',
    'medium':   'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-medium-q5.bin',
};

export const modelSizes = {
    'tiny':     30,
    'base':     57,
    'small':    190,
    'medium':   514,
};


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