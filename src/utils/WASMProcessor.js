import localforage from "localforage";
import { readNextChunkFromIndexedDB } from "./indexedDB";

export class WASMProcessor {
    constructor() {
        this.audioOffset = 0;
        this.instance = null;
        this.chunkData = null;
        this.audio = null;
        this.language = 'ca';
        this.nthreads = navigator.hardwareConcurrency ?
            Math.max(1, Math.floor(navigator.hardwareConcurrency * 0.8)) :
            4;
        this.translate = false;

        // Module initialization
        window.Module.print = this.printAndCheck.bind(this);
        window.Module.printErr = this.printAndCheck.bind(this);
        window.Module.setStatus = function(text) {
            console.log('js:', text);
        }
        window.Module.monitorRunDependencies = function(left) {
        }

        // Miscelaneous
        this.timeoutId = null;

        // Printing
        this.linesCallback = null;
        this.audioPartsCallback = null;
    }

    async printAndCheck(str) {
        const finish_commands = [
            'whisper_print_timings:',
        ]

        const debug_commands = [
            'whisper_init_from_file_no_state:',
            'whisper_model_load:',
            'whisper_init_state:',
            'system_info:',
            'operator():'
        ]

        if (debug_commands.some(cmd => str.includes(cmd))) {
            console.debug(str);
            return;
        }

        if (finish_commands.some(cmd => str.includes(cmd))) {
            if (this.timeoutId) clearTimeout(this.timeoutId);

            this.timeoutId = setTimeout(() => {
                this.processNextAudio();
                this.addOffset();
            }, 1000);

            return;
        }

        // document.body.innerHTML += str + '<br>';
        this.linesCallback(str);
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
                    // console.error('Error reading chunk from IndexedDB', err);
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
        const reader = new FileReader();
        reader.onload = async (event) => {
            this.audioPartsCallback(reader.result);
        };

        reader.readAsDataURL(this.audio);
    }

    async addOffset() {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const audioDataUrl = reader.result;
    
            // Create a new Audio object
            const audio = new Audio(audioDataUrl);
    
            // Once the audio is loaded, get its duration
            audio.onloadedmetadata = () => {
                const audioLengthInSeconds = audio.duration;
                this.audioOffset += audioLengthInSeconds;
            };
        };
    
        reader.readAsDataURL(this.audio);
    }

    async processNextAudio() {
        if (!this.instance) this.loadInstance();

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

    setOutput({ lines, audioParts }) {
        this.linesCallback = lines;
        this.audioPartsCallback = audioParts;
    }

}