import { useEffect, useState } from "react";

function Output({ processor, isModelLoaded, isAudioLoaded }) {
    const [lines, setLines] = useState([]);
    const [audioParts, setAudioParts] = useState([]);
    const [fullAudio, setFullAudio] = useState(null);
    const [state, setState] = useState(0);

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

    const printState = (state) => {
        switch (state) {
            case 0:
                return 'Falta triar quin tipus de transcripció vols fer i carregar un àudio';
            case 1:
                return 'Falta carregar un àudio';
            case 2:
                return 'Falta triar quin tipus de transcripció vols fer';
            case 3:
                return 'Preparat.';
            case 4:
                return 'Processant àudio...';
            case 5:
                return 'Àudio processat. Comença la transcripció...';
            case 6:
                return 'Transcripció en curs...';
            case 7:
                return 'Transcripció finalitzada';
            default:
                return 'Desconegut';
        }
    }

    return (
        <div>
            <h2>Estat</h2>
            <div>
                {printState(state)}
            </div>

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