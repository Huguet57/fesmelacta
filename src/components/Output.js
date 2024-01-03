import { useEffect, useState } from "react";
import StateOutput from "./output/StateOutput";
import '../styles/output.css'
import FullAudio from "./output/FullAudio";
import TranscripcioOutput from "./output/TranscripcioOutput";

function Output({ state, setState, processor, isModelLoaded, isAudioLoaded }) {
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

    return (
        <div>
            <StateOutput state={state} />
            <FullAudio fullAudio={fullAudio} />

            <TranscripcioOutput lines={lines} state={state} />
        </div>
    );
}

export default Output;