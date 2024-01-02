import localforage from "localforage";

const getIthChunk = async (i) => {
    return new Promise((resolve, reject) => {
        localforage.getItem('file').then(file => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const audioData = reader.result;
                const chunkSize = (file.type === 'audio/mpeg' ? 1 : 2) * (10 * 60 * 16000 + 44); // 10 minutes of audio

                if (i * chunkSize >= audioData.byteLength) {
                    resolve(null);
                    return;
                }

                const header = audioData.slice(0, 44); // Get the header of the file
                let chunk = audioData.slice(i * chunkSize + (i === 0 ? 44 : 0), (i + 1) * chunkSize);

                // Hack per que no passi lo que el primer chunk posa que dura tot el fitxer
                if (file.type === 'audio/mpeg') chunk = audioData.slice(i * chunkSize + 44 + 1, (i + 1) * chunkSize);
                
                resolve(new Blob([header, chunk], {type: file.type}));
            }

            reader.readAsArrayBuffer(file);
        }).catch(err => {
            reject(err);
        });
    });
}

const decodeAudioData = async (file) => {
    const kSampleRate = 16000;

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    const context = new AudioContext({
        sampleRate: kSampleRate,
        channelCount: 1,
        echoCancellation: false,
        autoGainControl:  true,
        noiseSuppression: true,
    });

    return new Promise((resolve, reject) => {
        var reader = new FileReader();

        reader.onload = function(event) {
            var buf = new Uint8Array(reader.result);

            context.decodeAudioData(buf.buffer, function(audioBuffer) {
                var offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
                var source = offlineContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(offlineContext.destination);
                source.start(0);

                offlineContext.startRendering().then(function(renderedBuffer) {
                    const chunkData = renderedBuffer.getChannelData(0);
                    resolve(chunkData);
                });
            }, function(e) {
                // console.log(e);
                reject(e);
            });
        }

        reader.readAsArrayBuffer(file);
    });
}

export { getIthChunk, decodeAudioData };