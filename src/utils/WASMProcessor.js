import localforage from "localforage";
import { readNextChunkFromIndexedDB } from "./indexedDB";

export class WASMProcessor {
    constructor() {
        this.currentChunk = 0;
        this.instance = null;
        this.chunkData = null;
        this.audio = null;
        this.language = 'ca';
        this.nthreads = navigator.hardwareConcurrency ?
            Math.max(1, Math.floor(navigator.hardwareConcurrency * 0.8)) :
            4;
        this.translate = false;

        // Module initialization
        window.Module.print = console.log;
        window.Module.printErr = console.error;
        window.Module.setStatus = function(text) {
            console.log('js:', text);
        }
        window.Module.monitorRunDependencies = function(left) {
        }
    }

    async printAndCheck(str) {
        const finish_commands = [
            'whisper_print_timings:',
        ]

        if (finish_commands.some(cmd => str.includes(cmd))) {
            this.processNextAudio();
            return;
        }

        console.log(str);
    }

    async loadAudioChunk() {
        return new Promise((resolve, reject) => {
            readNextChunkFromIndexedDB()
                .then(async ([chunkAudio, chunkData]) => {
                    if (!chunkData) {
                        console.log("All chunks processed.");
                        resolve(false);
                    }

                    this.audio = chunkAudio;
                    this.chunkData = chunkData;
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
            window.Module.FS_unlink(fname);
        } catch (e) {
            // ignore
        }

        window.Module.FS_createDataFile("/", fname, buf, true, true);
    }

    async loadInstance() {
        this.instance = window.Module.init('whisper.bin');
    }

    async showAudio() {
        const el = document.createElement('audio');
        el.controls = true;

        const reader = new FileReader();
        reader.onload = async (event) => {
            el.src = reader.result;
        };

        reader.readAsDataURL(this.audio);

        document.body.appendChild(el);
    }

    async processNextAudio() {
        this.loadInstance();

        const audioFound = await this.loadAudioChunk()
        if (!audioFound) return;

        this.showAudio();

        const result = window.Module.full_default(
            this.instance, 
            this.chunkData, 
            this.language, 
            this.nthreads,
            this.translate,
        )
    }

    async process() {
        this.processNextAudio();
    }

    async setModel(model) {
        await this.storeModel(model);
    }

    setLanguage(language) {
        this.language = language;
    }
}