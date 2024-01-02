import { useEffect, useState } from "react";

function Output({ processor }) {
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

    useEffect(() => {
        processor?.setOutput({
            lines: addNewLine,
            audioParts: addNewAudioPart,
            fullAudio: addFullAudio,
        });
    }, [processor]);

    return (
        <div>
            <h2>Àudio complet</h2>
            <div>
                {fullAudio && <audio controls src={fullAudio}></audio>}
            </div>

            {/* <h2>Parts de l'àudio</h2>
            <div>
                {audioParts.map((audioPart, index) => <audio key={index} controls src={audioPart}></audio>)}
            </div> */}

            <h2>Transcripció</h2>
            <div>
                {lines.map((line, index) => <div key={index}>{line}</div>)}
            </div>
        </div>
    );
}

export default Output;