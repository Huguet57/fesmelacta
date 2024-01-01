import localForage from "localforage";
import { chunkAudioFile, getIthChunk } from './chunking';

let currentChunkIndex = 0;
const CHUNK_SIZE = 1024; // Define your chunk size here

const saveModelToIndexedDB = async (model) => {
    try {
        await localForage.setItem('model', model);
        return true;
    } catch (err) {
        console.error('Error saving model to IndexedDB', err);
        return false;
    }
};

const loadModelFromIndexedDB = async () => {
    try {
        const model = await localForage.getItem('model');
        return model;
    } catch (err) {
        console.error('Error loading model from IndexedDB', err);
        return null;
    }
}

// Save the audio file to IndexedDB
const saveFileToIndexedDB = async (file) => {
    try {
        await localForage.setItem('audioFile', file);
        currentChunkIndex = 0; // Reset the read position whenever a new file is saved
        return true;
    } catch (err) {
        console.error('Error saving file to IndexedDB', err);
        return false;
    }
};

// Read the next chunk of the audio file from IndexedDB
const readNextChunkFromIndexedDB = async () => {
    try {
        const file = await localForage.getItem('audioFile');
        return getIthChunk(file, currentChunkIndex++, CHUNK_SIZE);
    } catch (err) {
        console.error('Error reading chunk from IndexedDB', err);
        return null;
    }
};

export { saveFileToIndexedDB, readNextChunkFromIndexedDB, saveModelToIndexedDB, loadModelFromIndexedDB };