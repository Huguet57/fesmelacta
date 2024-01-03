import localforage from "localforage";

function lengthOggHeader(audioData) {
    // Create a DataView for easier access to the binary data
    const dataView = new DataView(audioData);

    // The capture pattern ("OggS") is 4 bytes
    const capturePattern = String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3));
    if (capturePattern !== 'OggS') {
        console.error('Not a valid OGG file');
        return;
    }

    // Skip 22 bytes (version, header type, granule position, bitstream serial number, page sequence number, checksum)
    const headerFixedPartLength = 26;

    // Get the number of page segments from the 27th byte
    const pageSegments = dataView.getUint8(26);

    // Calculate total header length
    const totalHeaderLength = headerFixedPartLength + pageSegments;

    return totalHeaderLength;
}

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

                const headerLength = file.type === 'audio/ogg' ? lengthOggHeader(audioData) : 44;
                const header = audioData.slice(0, headerLength); // Get the header of the file

                const chunkStart = Math.max(i * chunkSize, headerLength);
                const chunkEnd = Math.min((i + 1) * chunkSize, audioData.byteLength);
                let chunk = audioData.slice(chunkStart, chunkEnd);

                console.log('headerLength', headerLength, 'chunkStart', chunkStart, 'chunkEnd', chunkEnd, 'chunkSize', chunkSize, 'audioData.byteLength', audioData.byteLength);
                
                // Hack per que no passi lo que el primer chunk posa que dura tot el fitxer
                if (file.type === 'audio/mpeg') chunk = audioData.slice(chunkStart + 1, chunkEnd);
                
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