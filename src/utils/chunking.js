import localforage from "localforage";
import { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const dataURLfromArrayBuffer = (buffer) => {
    const CHUNK_SIZE = 0x8000; // Arbitrary size
    const array = new Uint8Array(buffer);
    let base64 = '';

    for (let i = 0; i < array.length; i += CHUNK_SIZE) {
        const chunk = array.subarray(i, i + CHUNK_SIZE);
        base64 += String.fromCharCode.apply(null, chunk);
    }

    return 'data:audio/wav;base64,' + window.btoa(base64);
};

export function convertToWav(audioData, type) {
    const ffmpeg = new FFmpeg({ log: true });

    const loadFFmpeg = async () => {
        if (!ffmpeg.loaded) {
            try {
                const baseURL = 'https://whisper-cpp-models.s3.eu-west-3.amazonaws.com';
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                });
            } catch (error) {
                console.error('Failed to load FFmpeg:', error);
                throw error;
            }
        }
    };

    return new Promise(async (resolve, reject) => {
        try {
            await loadFFmpeg();

            const uint8Array = new Uint8Array(audioData);

            await ffmpeg.writeFile(`audio.${type}`, uint8Array);

            await ffmpeg.exec(['-i', `audio.${type}`, '-ac', '1', '-ar', '16000', '-f', 'wav', '-map_metadata', '-1', 'audio.wav']);

            const converted_uint8Array = await ffmpeg.readFile('audio.wav');
            const data = converted_uint8Array.buffer;

            resolve(data);
        } catch (err) {
            reject(err);
        }
    });
}

const getIthChunk = async (i) => {
    return new Promise((resolve, reject) => {
        localforage.getItem('audio').then(async audioData => {
            const chunkSize = 2 * 10 * 60 * 16000; // 10 minutes of audio at 16kHz

            if (i * chunkSize >= audioData.byteLength) {
                resolve(null);
                return;
            }

            const headerLength = 100;
            const header = audioData.slice(0, headerLength); // Get the header of the file

            const chunkStart = Math.max(i * chunkSize, headerLength);
            const chunkEnd = Math.min((i + 1) * chunkSize, audioData.byteLength);
            let chunk = audioData.slice(chunkStart, chunkEnd);

            console.log('chunkStart', chunkStart, 'chunkEnd', chunkEnd, 'chunkSize', chunkSize, 'audioData.byteLength', audioData.byteLength);

            resolve(new Blob([header, chunk], {type: 'audio/wav'}));
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