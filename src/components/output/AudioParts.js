import { useEffect, useState } from "react";
import { secondsToHHMMSS } from "../../utils/chunking";
import SideBySide from "../extra/SideBySide";

const Part = ({ end, offset, audioPart, last }) => {
    const nextOffset = Math.min(end, offset + 10 * 60);

    return (
        <SideBySide
            justifyContent="space-between"
            style={{
                marginTop: 5,
                marginBottom: 5,  
            }}
        >
            <div
                style={{
                    fontSize: 14,
                }}
            >
                {
                    last ? 'Transcivint part...' : 'Fet.'
                }
            </div>
            <div
                style={{
                    fontSize: 14,
                }}
            >
                [{secondsToHHMMSS(offset)} - {secondsToHHMMSS(nextOffset)}]
            </div>

            <audio
                controls
                src={audioPart}
            />
        </SideBySide>
    )
}

function AudioParts({ processor, audioParts, state }) {
    const [offset, setOffset] = useState(0);
    const lastAudioPart = audioParts[audioParts.length - 1];

    useEffect(() => {
        if (processor) {
            setOffset(
                processor.start + processor.audioOffset
            );
        }
    }, [
        processor,
    ]);


    return (
        <div
            style={{
                margin: 10,
            }}
        >
            {
                audioParts.map((audioPart, index) => (
                    <Part
                        key={index}
                        end={processor?.end || 1e8}
                        offset={offset}
                        audioPart={audioPart}
                        last={state < 7 && index === audioParts.length - 1}
                    />
                ))
            }
        </div>
    )
}

export default AudioParts;