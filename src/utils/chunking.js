import localforage from "localforage";
import { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

function convertToWav(audioData, type) {
    const ffmpeg = new FFmpeg({ log: true });

    const loadFFmpeg = async () => {
        if (!ffmpeg.loaded) {
            try {
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

                // Load ffmpeg-core.js into IndexedDB
                let coreURL = await localforage.getItem('ffmpeg-core.js');
                if (!coreURL) {
                    coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
                    await localforage.setItem('ffmpeg-core.js', coreURL);
                }

                // Load ffmpeg-core.wasm into IndexedDB
                let wasmURL = await localforage.getItem('ffmpeg-core.wasm');
                if (!wasmURL) {
                    wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
                    await localforage.setItem('ffmpeg-core.wasm', wasmURL);
                }

                await ffmpeg.load({
                    coreURL,
                    wasmURL,
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
        localforage.getItem('file').then(file => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const preAudioData = reader.result;

                const audioData = 
                    file.type === 'audio/mpeg' ? preAudioData :     // Already covered
                    file.type === 'audio/wav' ? preAudioData :      // Already covered
                    file.type === 'audio/ogg' ? await convertToWav(preAudioData, 'ogg') :
                    file.type === 'audio/flac' ? await convertToWav(preAudioData, 'flac') :
                    file.type === 'audio/aac' ? await convertToWav(preAudioData, 'aac') :
                    file.type === 'audio/x-m4a' ? await convertToWav(preAudioData, 'm4a') :
                    preAudioData;

                const chunkSize = 
                    file.type === 'audio/mpeg' ? 1 * 10 * 60 * 16000 : // 10 minutes of audio
                    file.type === 'audio/wav' ? 2 * 10 * 60 * 16000 : // 10 minutes of audio
                    // file.type === 'audio/ogg' ? 500000 : // ? minutes of audio
                    2 * 10 * 60 * 16000; // 10 minutes of audio

                if (i * chunkSize >= audioData.byteLength) {
                    resolve(null);
                    return;
                }

                const headerLength = 100;
                const header = audioData.slice(0, headerLength); // Get the header of the file

                const chunkStart = Math.max(i * chunkSize, headerLength);
                const chunkEnd = Math.min((i + 1) * chunkSize, audioData.byteLength);
                let chunk = audioData.slice(chunkStart, chunkEnd);

                // console.log('chunkStart', chunkStart, 'chunkEnd', chunkEnd, 'chunkSize', chunkSize, 'audioData.byteLength', audioData.byteLength);

                // Hack per que no passi lo que el primer chunk posa que dura tot el fitxer
                if (file.type === 'audio/mpeg') chunk = audioData.slice(chunkStart + 1, chunkEnd);
                
                resolve(new Blob([header, chunk], {type: 'audio/wav'}));
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