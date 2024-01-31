import React, { useState, useEffect } from 'react';
import { WASMProcessor } from './utils/WASMProcessor';
import FileUploader from './components/FileUploader';
import ModelLoader from './components/ModelLoader';
import Processor from './components/Processor';
import Output from './components/Output';
import Header from './components/extra/Header';
import LanguageSelector from './components/model/LanguageSelector';
import './styles/common.css';
import SideBySide from './components/extra/SideBySide';
import Credits from './components/extra/Credits';
import FeedbackForm from './components/extra/FeedbackForm';

const AudioProcessor = () => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [processor, setProcessor] = useState(null);
    const [state, setState] = useState(0);
    const [fileName, setFileName] = useState(null);

    useEffect(() => {
        setProcessor(new WASMProcessor());
    }, []);

    return (
        <div>
            <Header />

            <ModelLoader state={state} setState={setState} processor={processor} success={() => setIsModelLoaded(true)} error={(err) => console.error(err)} />

            {
                state <= 3 && <>
                    <FileUploader setFileName={setFileName} isAudioLoaded={isAudioLoaded} state={state} processor={processor} success={() => setIsAudioLoaded(true)} error={(err) => console.error(err)} />
                    
                    <SideBySide>
                        <LanguageSelector state={state}  processor={processor} />
                        <Processor state={state} processor={processor} />
                    </SideBySide>
                </>
            }

            <Output fileName={fileName} state={state} setState={setState} processor={processor} isModelLoaded={isModelLoaded} isAudioLoaded={isAudioLoaded} />
            
            <FeedbackForm />
            <Credits />
        </div>
    );
}

export default AudioProcessor;