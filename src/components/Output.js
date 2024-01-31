import { useEffect, useState } from "react";
import StateOutput from "./output/StateOutput";
import '../styles/output.css'
import FullAudio from "./output/FullAudio";
import TranscripcioOutput from "./output/TranscripcioOutput";
import AudioParts from "./output/AudioParts";

function Output({ fileName, state, setState, processor, isModelLoaded, isAudioLoaded }) {
    const [lines, setLines] = useState([]);
    const [audioParts, setAudioParts] = useState([]);
    const [fullAudio, setFullAudio] = useState(null);

    const addNewLine = (line) => {
        setLines(prev => [...prev, line]);
    }

    const addNewAudioPart = (audioPart) => {
        setAudioParts(prev => [...prev, audioPart]);
    }

    const addFullAudio = (audio) => {
        setFullAudio(audio);
    }

    const changeState = (newState) => {
        setState(prev => Math.max(prev, newState));
    }

    useEffect(() => {
        processor?.setOutput({
            lines: addNewLine,
            audioParts: addNewAudioPart,
            fullAudio: addFullAudio,
            changeState,
        });
    }, [processor]);

    useEffect(() => {
        if (!isModelLoaded && !isAudioLoaded) {
            setState(0);
        }

        if (isModelLoaded && !isAudioLoaded) {
            setState(1);
        }

        if (!isModelLoaded && isAudioLoaded) {
            setState(2);
        }

        if (isModelLoaded && isAudioLoaded) {
            setState(3);
        }
    }, [
        isModelLoaded,
        isAudioLoaded,
    ]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (state > 3 && state < 7) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [state]);

    return (
        <div>
            <StateOutput state={state} />
            <FullAudio fullAudio={fullAudio} />
            {/* <AudioParts processor={processor} audioParts={audioParts} state={state} /> */}

            <TranscripcioOutput fileName={fileName} lines={lines} state={state} />
        </div>
    );
}

export default Output;