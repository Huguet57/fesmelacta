import { useEffect, useState } from "react";

function Output({ processor }) {
    const [lines, setLines] = useState([]);
    const [audioParts, setAudioParts] = useState([]);

    const addNewLine = (line) => {
        setLines(prev => [...prev, line]);
    }

    const addNewAudioPart = (audioPart) => {
        setAudioParts(prev => [...prev, audioPart]);
    }

    useEffect(() => {
        processor?.setOutput({
            lines: addNewLine,
            audioParts: addNewAudioPart,
        });
    }, [processor]);

    return (
        <div>
            <h2>Parts de l'àudio</h2>
            <div>
                {audioParts.map((audioPart, index) => <audio key={index} controls src={audioPart}></audio>)}
            </div>

            <h2>Transcripció</h2>
            <div>
                {lines.map((line, index) => <div key={index}>{line}</div>)}
            </div>
        </div>
    );
}

export default Output;