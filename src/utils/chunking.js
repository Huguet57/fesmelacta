import localforage from "localforage";
import { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const dataURLfromArrayBuffer = async (buffer) => {
    // Convert ArrayBuffer to Blob
    const blob = new Blob([buffer], { type: 'audio/wav' });

    // Create a FileReader to read the Blob
    const reader = new FileReader();

    // Return a new Promise
    return new Promise((resolve, reject) => {
        // On successful read, resolve the Promise with the data URL
        reader.onloadend = () => resolve(reader.result);

        // On error, reject the Promise
        reader.onerror = (e) => reject(e);

        // Read the Blob as a data URL
        reader.readAsDataURL(blob);
    });
};

export const getAudioLength = async (file) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = function() {
            const duration = audio.duration;
            resolve(duration);
        };
        audio.onerror = function() {
            reject();
        }
    });
}

export const secondsToHHMMSS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - (hours * 3600)) / 60);
    const remainingSeconds = seconds - (hours * 3600) - (minutes * 60);

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

export function convertToWav(audioData, type, start=null, end=null) {
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

            if (end) {
                await ffmpeg.exec(['-i', `audio.${type}`, '-ss', secondsToHHMMSS(start || 0), '-to', secondsToHHMMSS(end), '-ac', '1', '-ar', '16000', '-f', 'wav', '-map_metadata', '-1', 'audio.wav']);
            } else {
                await ffmpeg.exec(['-i', `audio.${type}`, '-ss', secondsToHHMMSS(start || 0), '-ac', '1', '-ar', '16000', '-f', 'wav', '-map_metadata', '-1', 'audio.wav']);
            }

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

const getBufferData = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(new Uint8Array(reader.result));
        };
        reader.readAsArrayBuffer(file);
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

export { getIthChunk, decodeAudioData, getBufferData };