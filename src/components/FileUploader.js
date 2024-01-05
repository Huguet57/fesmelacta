import React, { useEffect, useState } from 'react';
import { saveFileToIndexedDB } from '../utils/indexedDB';
import SideBySide from './extra/SideBySide';
import { getAudioLength } from '../utils/chunking';

export const secondsToHMS = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds - (h * 3600)) / 60);
    const s = seconds - (h * 3600) - (m * 60);

    return {
        h,
        m,
        s,
    };
};

const FileUploader = ({ isAudioLoaded, processor, success, error, state }) => {
    const [start, setStart] = useState({
        h: 0,
        m: 0,
        s: 0,
    });

    const [end, setEnd] = useState({
        h: null,
        m: null,
        s: null,
    });

    const [lengthLoaded, setLengthLoaded] = useState(false);

    const saveFileToDB = async (file) => {
        saveFileToIndexedDB(file);
        success();
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        saveFileToDB(file);
        setEnd(secondsToHMS(await getAudioLength(file)));
    }

    useEffect(() => {
        if (
            end.h !== null &&
            end.m !== null &&
            end.s !== null
        ) {
            setLengthLoaded(true);
        }
    }, [
        end
    ]);

    useEffect(() => {
        if (
            processor &&
            start.h !== null &&
            start.m !== null &&
            start.s !== null &&
            end.h !== null &&
            end.m !== null &&
            end.s !== null
        ) {
            const startSeconds = start.h * 3600 + start.m * 60 + start.s;
            const endSeconds = end.h * 3600 + end.m * 60 + end.s;

            processor.setStart(startSeconds);
            processor.setEnd(endSeconds);
        }
    }, [
        processor,
        start,
        end,
    ]);

    const isDisabled = 3 < state && state < 7;

    return (
        <div
            style={{
                marginTop: '20px',
                marginBottom: '20px',
            }}
        >
            <SideBySide
                justifyContent='space-between'
            >
                <div>
                    <label className='title' htmlFor="file">Fitxer d'àudio: </label>
                    <input
                        disabled={isDisabled}
                        type="file"
                        onChange={handleFileChange}
                        accept="audio/*"
                    />

                    <div
                        style={{
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '10px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <em>Ja es poden penjar àudios d'hores de llargada!</em>
                    </div>
                </div>

                {
                    lengthLoaded && (
                        <div
                            style={{
                                display: isAudioLoaded ? 'flex' : 'none',
                                alignItems: 'flex-end',
                                flexDirection: 'column',
                                gap: 5,
                                fontSize: '12px',
                            }}
                        >
                            <div>
                                <label className="title" htmlFor="start">Inici: </label>
                                <input
                                    disabled={isDisabled}
                                    defaultValue={start.h}
                                    onChange={(event) => {
                                        setStart(prev => ({
                                            ...prev,
                                            h: parseInt(event.target.value),
                                        }))
                                    }}
                                    type="number"
                                    min="0"
                                    step="1"
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>h</span>
                                <input
                                    disabled={isDisabled}
                                    defaultValue={start.m}
                                    onChange={(event) => {
                                        setStart(prev => ({
                                            ...prev,
                                            m: parseInt(event.target.value),
                                        }))
                                    }}
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="1"
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>m</span>
                                <input
                                    id="start"
                                    disabled={isDisabled}
                                    defaultValue={start.s}
                                    onChange={(event) => {
                                        setStart(prev => ({
                                            ...prev,
                                            s: parseInt(event.target.value),
                                        }))
                                    }}
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="1"
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>s</span>
                            </div>
                            <div>
                                <label className="title" htmlFor="end">Fi: </label>
                                <input
                                    disabled={isDisabled}
                                    defaultValue={end.h}
                                    onChange={(event) => {
                                        setEnd(prev => ({
                                            ...prev,
                                            h: parseInt(event.target.value),
                                        }))
                                    }}
                                    type="number"
                                    min="0"
                                    step="1"
                                    max={end.h}
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>h</span>
                                <input
                                    disabled={isDisabled}
                                    defaultValue={end.m}
                                    onChange={(event) => {
                                        setEnd(prev => ({
                                            ...prev,
                                            m: parseInt(event.target.value),
                                        }))
                                    }}
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="1"
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>m</span>
                                <input
                                    id="end"
                                    defaultValue={end.s}
                                    onChange={(event) => {
                                        setEnd(prev => ({
                                            ...prev,
                                            s: parseInt(event.target.value),
                                        }))
                                    }}
                                    disabled={isDisabled}
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="1"
                                    style={{
                                        width: '30px',
                                    }}
                                />
                                <span style={{ margin: '0 5px' }}>s</span>
                            </div>
                        
                        </div>
                    )
                }
            </SideBySide>
        </div>
    );
}

export default FileUploader;