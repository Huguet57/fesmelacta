import localForage from "localforage";
import { chunkAudioFile, decodeAudioData, getIthChunk } from './chunking';
import localforage from "localforage";

let currentChunkIndex = 0;

export const saveAudioToIndexedDB = async (audio) => {
    try {
        await localforage.setItem('audio', audio);
        return true;
    } catch (err) {
        // console.error('Error saving audio to IndexedDB', err);
        return false;
    }
};

const saveModelToIndexedDB = async (modelName, data) => {
    try {
        await localForage.setItem(modelName, data);
        return true;
    } catch (err) {
        // console.error('Error saving model to IndexedDB', err);
        return false;
    }
};

const loadModelFromIndexedDB = async (modelName) => {
    try {
        const model = await localForage.getItem(modelName);
        return model;
    } catch (err) {
        // console.error('Error loading model from IndexedDB', err);
        return null;
    }
}

// Save the audio file to IndexedDB
const saveFileToIndexedDB = async (file) => {
    try {
        await localForage.setItem('file', file);
        currentChunkIndex = 0; // Reset the read position whenever a new file is saved
        return true;
    } catch (err) {
        // console.error('Error saving file to IndexedDB', err);
        return false;
    }
};

// Read the next chunk of the audio file from IndexedDB
const readNextChunkFromIndexedDB = async () => {
    try {
        const chunk = await getIthChunk(currentChunkIndex++);
        const [bufferData, channelData] = await decodeAudioData(chunk);
        return [chunk, bufferData, channelData];
    } catch (err) {
        // console.error('Error reading chunk from IndexedDB', err);
        return [null, null];
    }
};

export { saveFileToIndexedDB, readNextChunkFromIndexedDB, saveModelToIndexedDB, loadModelFromIndexedDB };