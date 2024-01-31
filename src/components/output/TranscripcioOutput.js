import localforage from 'localforage';
import React, { useState, useRef, useEffect } from 'react';
import { printState } from './StateOutput';

const CopyIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path></svg>
);

const CheckIcon = () => (
    <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 1171.000000 1280.000000" preserveAspectRatio="xMidYMid meet">
        <metadata>
        Created by potrace 1.15, written by Peter Selinger 2001-2017
        </metadata>
        <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
        <path d="M11555 12694 c-1288 -888 -2591 -2076 -3945 -3594 -1475 -1656 -3026 -3783 -4315 -5918 -72 -119 -115 -180 -123 -177 -8 3 -716 474 -1575 1048 -859 574 -1568 1047 -1576 1052 -11 6 -10 2 2 -16 98 -140 3704 -5078 3709 -5079 3 0 34 66 68 148 1225 2918 2422 5234 3838 7427 1148 1777 2481 3497 3899 5028 91 97 163 177 161 177 -2 0 -67 -43 -143 -96z"/>
        </g>
    </svg>
);

function DownloadIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z" fill="#1C274C"/>
            <path d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z" fill="#1C274C"/>
        </svg>
    );
}

function convertToSrt(lines) {
    let srtContent = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line) {
            // Extract timecodes and subtitle text
            const match = line.match(/\[(.*?)\] (.*)/);
            if (match && match.length === 3) {
                const timecode = match[1].replace(/\./g, ',');
                const subtitleText = match[2];

                // Append to SRT content
                srtContent += `${i + 1}\n`;
                srtContent += `${timecode}\n`;
                srtContent += `${subtitleText}\n\n`;
            }
        }
    }

    return srtContent;
}

function downloadSrt(lines) {
    const srtContent = convertToSrt(lines);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function TranscripcioOutput({ lines, state }) {
    const [filterBrackets, setFilterBrackets] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [hasUserScrolledFromBottom, setHasUserScrolledFromBottom] = useState(false);
    const textAreaRef = useRef(null);

    const handleCopyClick = () => {
        const text = textAreaRef.current.value;
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000); // Reset copy success message after 2 seconds
        }, (err) => {
            console.error('Error copying text: ', err);
        });
    };

    const filterOutBrackets = (text) => {
        const regex = /^\[\d\d:\d\d:\d\d\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d\]\s*/;
        return text.replace(regex, '');
    };

    const handleFilterChange = (e) => {
        setFilterBrackets(e.target.checked)
        localforage.setItem('filterBrackets', e.target.checked);
    };

    useEffect(() => {
        localforage.getItem('filterBrackets').then((value) => {
            setFilterBrackets(value ? true : false);
        }).catch((err) => {
            setFilterBrackets(false);
        });
    }, []);

    const handleScroll = () => {
        const isAtBottomThreshold = 10;
        const isAtBottom = textAreaRef.current.scrollHeight - textAreaRef.current.scrollTop <= textAreaRef.current.clientHeight + isAtBottomThreshold;
        setHasUserScrolledFromBottom(!isAtBottom);
    };

    useEffect(() => {
        const textArea = textAreaRef.current;
        textArea.addEventListener('scroll', handleScroll);

        return () => {
            textArea.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!hasUserScrolledFromBottom) {
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
        }
    }, [lines, hasUserScrolledFromBottom]);

    const filteredLines = lines
        .filter(line => line !== '')
        .map(line => (filterBrackets ? filterOutBrackets(line) : line))
        .join('\n');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '8px',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                padding: '2px 10px',
                gap: '10px',
                marginBottom: '-20px',
                backgroundColor: 'rgb(235,235,235)',
            }}>
                <div
                    style={{
                        display: 'flex',
                        // gap: '5px',
                        alignItems: 'center',
                    }}
                >
                    <button
                        style={{
                            background: 'transparent',
                            color: '#333',
                            padding: '8px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '8px 8px',
                        }}
                        onClick={handleCopyClick}
                    >
                        {
                            copySuccess ? <><CheckIcon /> Copiat!</> : <><CopyIcon /> Copia el text</>
                        }
                    </button>
                    <button
                        style={{
                            background: 'transparent',
                            color: '#333',
                            padding: '8px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '8px 8px',
                        }}
                        onClick={() => downloadSrt(lines)}
                    >
                        <DownloadIcon />
                        Exporta a .srt
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'normal',
                        color: '#333',
                    }}>
                        <input
                            type="checkbox"
                            disabled={filterBrackets === null}
                            checked={filterBrackets || false}
                            onChange={handleFilterChange}
                            style={{
                                width: '12px',
                                marginRight: '5px',
                            }}
                        />
                        Treure els temps
                    </label>
                </div>
            </div>
            <textarea
                ref={textAreaRef}
                placeholder={
                    state > 3 ? printState(state, true) :
                    "Aquí apareixerà la transcripció del text."
                }
                value={filteredLines}
                readOnly
            />
        </div>
    );
}

export default TranscripcioOutput;