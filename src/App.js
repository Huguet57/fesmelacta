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

    useEffect(() => {
        setProcessor(new WASMProcessor());
    }, []);

    return (
        <div>
            <ModelLoader processor={processor} success={() => setIsModelLoaded(true)} error={(err) => console.error(err)} />
            <FileUploader processor={processor} success={() => setIsAudioLoaded(true)} error={(err) => console.error(err)} />
            <Processor processor={processor} isModelLoaded={isModelLoaded} isAudioLoaded={isAudioLoaded} />
            <Output processor={processor} />
        </div>
    );
}

export default AudioProcessor;