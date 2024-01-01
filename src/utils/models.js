export const modelUrls = {
    'tiny.en':  'https://whisper.ggerganov.com/ggml-model-whisper-tiny.en.bin',
    'tiny':     'http://localhost:3001/models/ggml-model-whisper-tiny.bin',  // 'https://whisper.ggerganov.com/ggml-model-whisper-tiny.bin',
    'base.en':  'https://whisper.ggerganov.com/ggml-model-whisper-base.en.bin',
    'base':     'https://whisper.ggerganov.com/ggml-model-whisper-base.bin',
    'small.en': 'https://whisper.ggerganov.com/ggml-model-whisper-small.en.bin',
    'small':    'https://whisper.ggerganov.com/ggml-model-whisper-small.bin',

    'tiny-en-q5_1':  'https://whisper.ggerganov.com/ggml-model-whisper-tiny.en-q5_1.bin',
    'tiny-q5_1':     'https://whisper.ggerganov.com/ggml-model-whisper-tiny-q5_1.bin',
    'base-en-q5_1':  'https://whisper.ggerganov.com/ggml-model-whisper-base.en-q5_1.bin',
    'base-q5_1':     'https://whisper.ggerganov.com/ggml-model-whisper-base-q5_1.bin',
    'small-en-q5_1': 'https://whisper.ggerganov.com/ggml-model-whisper-small.en-q5_1.bin',
    'small-q5_1':    'https://whisper.ggerganov.com/ggml-model-whisper-small-q5_1.bin',
    'medium-en-q5_0':'https://whisper.ggerganov.com/ggml-model-whisper-medium.en-q5_0.bin',
    'medium-q5_0':   'https://whisper.ggerganov.com/ggml-model-whisper-medium-q5_0.bin',
    'large-q5_0':    'https://whisper.ggerganov.com/ggml-model-whisper-large-q5_0.bin',
};

export const modelSizes = {
    'tiny.en':  75,
    'tiny':     75,
    'base.en':  142,
    'base':     142,
    'small.en': 466,
    'small':    466,

    'tiny-en-q5_1':   31,
    'tiny-q5_1':      31,
    'base-en-q5_1':   57,
    'base-q5_1':      57,
    'small-en-q5_1':  182,
    'small-q5_1':     182,
    'medium-en-q5_0': 515,
    'medium-q5_0':    515,
    'large-q5_0':     1030,
};


export const fetchModel = (modelName) => {
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
            // console.error('fetchModel: failed to fetch ' + modelUrl);
            reject(null);
            return;
        }

        const chunks = [];
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
        }

        let position = 0;
        const receivedLength = chunks.reduce((total, arr) => total + arr.length, 0);
        const chunksAll = new Uint8Array(receivedLength);

        chunks.forEach(chunk => {
            chunksAll.set(chunk, position);
            position += chunk.length;
        });

        resolve(chunksAll);
    });
}
