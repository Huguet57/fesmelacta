import localforage from "localforage";
import { readNextChunkFromIndexedDB, saveAudioToIndexedDB } from "./indexedDB";
import { convertToWav, dataURLfromArrayBuffer } from "./chunking";
import { DecodingOptionsBuilder, Task, initialize } from "whisper-turbo";
import * as whisper from "whisper-webgpu";
import { fetchTokenizer } from "./models";

export class WASMProcessor {
    constructor() {
        this.audioOffset = 0;
        this.instance = null;
        this.chunkData = null;
        this.bufferData = null;
        this.audio = null;
        this.language = 'ca';
        this.nthreads = navigator.hardwareConcurrency ?
            Math.max(1, Math.floor(navigator.hardwareConcurrency * 0.8)) :
            4;
        this.translate = false;
        this.finished = false;

        // GPU
        this.isGPUEnabled = false;
        this.gpuSession = null;
        this.isGPUModel = false;

        // Check if GPU is enabled
        if ('gpu' in navigator) {
            navigator.gpu.requestAdapter()
                .then(adapter => {
                    if (adapter) return adapter.requestDevice()
                    else throw new Error('No adapter found');
                })
                .then(device => this.isGPUEnabled = device ? true : false)
                .catch(err => this.isGPUEnabled = false);
        } else {
            this.isGPUEnabled = false;
        }

        // Start and end
        this.start = null;
        this.end = null;

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
        this.fullAudioCallback = null;
        this.changeState = null;
    }

    async printAndCheck(str, last=false, already_offsetted=false) {
        if (str === '') return;
        if (this.finished) return;

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

        if (last || finish_commands.some(cmd => str.includes(cmd))) {
            console.log(str);

            if (this.timeoutId) clearTimeout(this.timeoutId);

            this.timeoutId = setTimeout(() => {
                this.processNextAudio();
                this.addOffset();
            }, 1000);

            return;
        }

        this.changeState(6); // Transcripció en curs...

        // Adjust the subtitle timings
        const adjustedStr = this.adjustSubtitles(str, already_offsetted ? 0 : this.audioOffset + this.start);
        this.linesCallback(adjustedStr);
    }

    adjustSubtitles(str, offset) {
        function convertToMs(timestamp) {
            const parts = timestamp.split(':');
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            const seconds = parseFloat(parts[2]);
            return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
        }
    
        function convertToTimestamp(milliseconds) {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            const ms = Math.floor(milliseconds % 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }

        const offsetInSeconds = offset * 1000; // Convert offset to milliseconds
        return str.replace(/\[([\d:.]+) --> ([\d:.]+)\]/g, (match, start, end) => {
            // Convert timestamps to milliseconds, add offset, and convert back to timestamp format
            const adjustedStart = convertToTimestamp(convertToMs(start) + offsetInSeconds);
            const adjustedEnd = convertToTimestamp(convertToMs(end) + offsetInSeconds);
            return `[${adjustedStart} --> ${adjustedEnd}]`;
        });
    }

    createTimestampSubtitles(start, end, offset) {
        function convertSToMs(seconds) {
            return Math.round(seconds * 1000);
        }

        function convertToTimestamp(milliseconds) {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            const ms = Math.floor(milliseconds % 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }

        const offsetInSeconds = offset * 1000; // Convert offset to milliseconds

        const adjustedStart = convertToTimestamp(convertSToMs(start) + offsetInSeconds);
        const adjustedEnd = convertToTimestamp(convertSToMs(end) + offsetInSeconds);

        return `[${adjustedStart} --> ${adjustedEnd}]`;
    }

    async kill() {
        // this?.gpuSession?.destroy();
        window?.Module["PThread"]?.terminateAllThreads();
        this.finished = true;
    }

    async loadAudio() {
        return new Promise(async (resolve, reject) => {
            localforage.getItem('file').then(file => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const preAudioData = reader.result;

                    const audioData = 
                        file.type === 'audio/wav' ? await convertToWav(preAudioData, 'wav', this.start, this.end) :
                        file.type === 'audio/mpeg' ? await convertToWav(preAudioData, 'mp3', this.start, this.end) :
                        file.type === 'audio/ogg' ? await convertToWav(preAudioData, 'ogg', this.start, this.end) :
                        file.type === 'audio/flac' ? await convertToWav(preAudioData, 'flac', this.start, this.end) :
                        file.type === 'audio/aac' ? await convertToWav(preAudioData, 'aac', this.start, this.end) :
                        file.type === 'audio/x-m4a' ? await convertToWav(preAudioData, 'm4a', this.start, this.end) :
                        await convertToWav(preAudioData, 'unknown');

                    await saveAudioToIndexedDB(audioData);

                    const asDataURL = await dataURLfromArrayBuffer(audioData);
                    this.showFullAudio(asDataURL);

                    resolve(true);            
                };
            
                reader.readAsArrayBuffer(file);
            }).catch(err => {
                // console.error('Error loading audio from IndexedDB', err);
                reject(err);
            });
        });
    }

    async loadAudioChunk() {
        return new Promise((resolve, reject) => {
            readNextChunkFromIndexedDB()
                .then(async ([chunkAudio, bufferData, chunkData]) => {
                    if (!chunkData) {
                        this.changeState(7); // Transcripció finalitzada
                        resolve(false);
                    }

                    this.audio = chunkAudio;
                    this.bufferData = bufferData;
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

    async showFullAudio(dataURL) {
        this.fullAudioCallback(dataURL);
    }

    async showAudioPart() {
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

    async processFullAudio() {
        if (this.finished) return;
        if (!this.gpuSession) return;

        setTimeout(() => this.changeState(5), 1000); // Àudio processat. Comença la transcripció...

        localforage.getItem('audio')
            .then(async fullAudio => {
                const audioData = new Uint8Array(fullAudio);

                let builder = new DecodingOptionsBuilder();
                builder = builder.setLanguage(this.language);
                builder = builder.setBestOf(5);
                builder = builder.setBeamSize(5);
                builder = builder.setSuppressTokens(Int32Array.from([]));
                builder = builder.setSuppressBlank(false);
                builder = builder.setTask(Task.Transcribe);
                const options = builder.build();

                await this.gpuSession.stream(
                    audioData,
                    false,
                    options,
                    (s) => {
                        const timestamp = this.createTimestampSubtitles(s.start, s.stop, this.audioOffset + this.start);
                        this.printAndCheck(timestamp + s.text, s.last, true);

                        if (s.last) {
                            this.changeState(7); // Transcripció finalitzada
                            this.kill();
                        }
                    }
                )
            });
    }

    async processNextAudio() {
        if (this.finished) return;
        setTimeout(() => this.changeState(5), 1000); // Àudio processat. Comença la transcripció...

        if (!this.instance) this.loadInstance();

        const audioFound = await this.loadAudioChunk()
        if (!audioFound) return;

        this.showAudioPart();

        const result = window.Module.full_default(
            this.instance, 
            this.chunkData, 
            this.language, 
            this.nthreads,
            this.translate,
        )
    }

    async process() {
        this.changeState(4); // Processant àudio...

        this.loadAudio()
            .then(() => {
                if (this.isGPUModel) this.processFullAudio();
                else this.processNextAudio();
            })
            .catch(err => {
                if (this.isGPUModel) this.processFullAudio();
                else this.processNextAudio();
            });
    }

    async setModel(modelName, model) {
        this.isGPUModel = modelName.toLowerCase().includes('gpu');

        if (this.isGPUModel) {
            const TOKENIZER = await fetchTokenizer('gpu');

            await whisper.default();
            const builder = new whisper.SessionBuilder();
            const session = await builder
                .setModel(model)
                .setTokenizer(TOKENIZER)
                .build()
            
            this.gpuSession = session;
            await initialize();
        } else {
            await this.storeModel(model);
        }
    }

    setLanguage(language) {
        this.language = language;
    }

    setOutput({ lines, audioParts, fullAudio, changeState }) {
        this.linesCallback = lines;
        this.audioPartsCallback = audioParts;
        this.fullAudioCallback = fullAudio;
        this.changeState = changeState;
    }

    setStart(start) {
        this.start = start;
    }

    setEnd(end) {
        this.end = end;
    }
}