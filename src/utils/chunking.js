import localforage from "localforage";

const getIthChunk = async (i, chunkSize) => {
    const audioFile = await localforage.getItem('audioFile');
    return new Blob([audioFile]);

    const header = audioFile.slice(0, 44); // Get the header of the file
    let chunk = audioFile.slice(i * chunkSize, (i + 1) * chunkSize);
    
    if (i !== 0) return new Blob([header, chunk]);
    else return new Blob([chunk]);
}

const decodeAudioData = async (audioData) => {
    return new Promise((resolve, reject) => {
        // Create a FileReader instance
        const reader = new FileReader();

        reader.onload = (event) => {
            // Create an AudioContext instance
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Decode the audio data from the chunk
            audioContext.decodeAudioData(reader.result, (buffer) => {
                const decodedData = buffer.getChannelData(0);
                resolve([reader.result, decodedData]);
            }, (error) => {
                console.error('Error decoding audio data', error);
                reject(error);
            });
        };

        reader.onerror = (event) => {
            console.error('Error reading file', event);
            reject(event);
        }

        // Read the audio data as an ArrayBuffer
        reader.readAsArrayBuffer(audioData);
    });
}

export { getIthChunk, decodeAudioData };