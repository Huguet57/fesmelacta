export const modelUrls = {
    'small':    'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-small-q5.bin',
    'medium':   'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com/whisper-medium-q5.bin',
};

export const modelSizes = {
    'small':    190,
    'medium':   514,
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
