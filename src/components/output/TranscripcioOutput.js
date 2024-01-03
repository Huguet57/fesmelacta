import React, { useState, useRef } from 'react';

const CopyIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path></svg>
);


function TranscripcioOutput({ lines }) {
    const [filterBrackets, setFilterBrackets] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
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
                        copySuccess ? 'Copiat!' : <><CopyIcon /> Copia el text</>
                    }
                </button>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'normal',
                        color: '#333',
                    }}>
                        <input
                            type="checkbox"
                            checked={filterBrackets}
                            onChange={(e) => setFilterBrackets(e.target.checked)}
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
                placeholder="Aquí apareixerà la transcripció del text."
                value={filteredLines}
                readOnly
            />
        </div>
    );
}

export default TranscripcioOutput;