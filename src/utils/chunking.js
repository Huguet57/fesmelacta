import localforage from "localforage";

const getIthChunk = async (i, chunkSize) => {
    const audioFile = await localforage.getItem('file');
    return new Blob([audioFile]);

    const header = audioFile.slice(0, 44); // Get the header of the file
    let chunk = audioFile.slice(i * chunkSize, (i + 1) * chunkSize);
    
    if (i !== 0) return new Blob([header, chunk]);
    else return new Blob([chunk]);
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
                console.log(e);
                reject(e);
            });
        }

        reader.readAsArrayBuffer(file);
    });
}

export { getIthChunk, decodeAudioData };