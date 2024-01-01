import { decodeAudioData } from "./chunking";
import { readNextChunkFromIndexedDB } from "./indexedDB";

export class WASMProcessor {
    constructor() {
        this.currentChunk = 0;
        this.instance = null;
        this.audioChunk = null;
        this.language = 'ca';
        this.nthreads = navigator.hardwareConcurrency ?
            Math.max(1, Math.floor(navigator.hardwareConcurrency * 0.8)) :
            4;
        this.translate = false;

        this.Module = {
            print: console.log, // printTextarea,
            printErr: console.log, // printTextarea,
            setStatus: function(text) {
                console.log('js:', text);
                // printTextarea('js: ' + text);
            },
            monitorRunDependencies: function(left) {
            }
        };
    }

    async loadAudioChunk() {
        return new Promise((resolve, reject) => {
            readNextChunkFromIndexedDB()
                .then(async chunk => {
                    if (!chunk) {
                        console.log("All chunks processed.");
                        resolve(false);
                    }

                    this.audioChunk = await decodeAudioData(chunk);
                    resolve(true);
                })
                .catch(err => {
                    console.error('Error reading chunk from IndexedDB', err);
                    reject(err);
                });
        });
    }

    async storeModel(buf, fname='whisper.bin') {
        try {
            this.Module.FS_unlink(fname);
        } catch (e) {
            // ignore
        }

        this.Module.FS_createDataFile("/", fname, buf, true, true);
    }

    async loadInstance() {
        this.instance = this.Module.init('whisper.bin');
    }

    async processAudio() {
        this.loadInstance();

        while (true) {
            const audioFound = await this.loadAudioChunk()
            if (!audioFound) break;

            const result = this.Module.full_default(
                this.instance, 
                this.audioChunk, 
                this.language, 
                this.nthreads,
                this.translate,
            )
        }
    }

    async process() {
        await this.processAudio();
    }

    async setModel(model) {
        await this.storeModel(model);
    }

    setLanguage(language) {
        this.language = language;
    }
}