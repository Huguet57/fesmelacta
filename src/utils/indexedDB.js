import localForage from "localforage";
import { chunkAudioFile, decodeAudioData, getIthChunk } from './chunking';
import localforage from "localforage";

let currentChunkIndex = 0;

const saveModelToIndexedDB = async (model) => {
    try {
        await localForage.setItem('model', model);
        return true;
    } catch (err) {
        // console.error('Error saving model to IndexedDB', err);
        return false;
    }
};

const loadModelFromIndexedDB = async () => {
    try {
        const model = await localForage.getItem('model');
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
        const chunkData = await decodeAudioData(chunk);
        return [chunk, chunkData];
    } catch (err) {
        // console.error('Error reading chunk from IndexedDB', err);
        return [null, null];
    }
};

export { saveFileToIndexedDB, readNextChunkFromIndexedDB, saveModelToIndexedDB, loadModelFromIndexedDB };