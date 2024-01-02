import React, { useState, useEffect } from 'react';
import { WASMProcessor } from './utils/WASMProcessor';
import FileUploader from './components/FileUploader';
import ModelLoader from './components/ModelLoader';
import Processor from './components/Processor';
import Output from './components/Output';

const AudioProcessor = () => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [processor, setProcessor] = useState(null);
    const [state, setState] = useState(0);

    useEffect(() => {
        setProcessor(new WASMProcessor());
    }, []);

    return (
        <div>
            <ModelLoader state={state} processor={processor} success={() => setIsModelLoaded(true)} error={(err) => console.error(err)} />
            <FileUploader state={state} processor={processor} success={() => setIsAudioLoaded(true)} error={(err) => console.error(err)} />
            <Processor state={state} processor={processor} />
            <Output state={state} setState={setState} processor={processor} isModelLoaded={isModelLoaded} isAudioLoaded={isAudioLoaded} />
        </div>
    );
}

export default AudioProcessor;