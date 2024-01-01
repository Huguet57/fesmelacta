import React, { useState, useEffect } from 'react';
import { WASMProcessor } from './utils/WASMProcessor';
import FileUploader from './components/FileUploader';
import ModelLoader from './components/ModelLoader';
import Processor from './components/Processor';

const AudioProcessor = () => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);

    const processor = new WASMProcessor();

    return (
        <div>
            <ModelLoader processor={processor} success={() => setIsModelLoaded(true)} />
            <FileUploader processor={processor} success={() => setIsAudioLoaded(true)} />
            <Processor processor={processor} isModelLoaded={isModelLoaded} isAudioLoaded={isAudioLoaded} />
        </div>
    );
}

export default AudioProcessor;