import React, { useState } from 'react';
import { saveFileToIndexedDB } from '../utils/indexedDB';

const FileUploader = ({ processor, success, error, state }) => {
    const saveFileToDB = async (file) => {
        saveFileToIndexedDB(file);
        success();
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        saveFileToDB(file);
    }

    const isDisabled = 3 < state && state < 7;

    return (
        <div
            style={{
                marginTop: '20px',
                marginBottom: '20px',
            }}
        >
            <label for="file">Fitxer d'àudio: </label>
            <input disabled={isDisabled} type="file" onChange={handleFileChange} accept="audio/wav,audio/mpeg" />

            <div
                style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <img
                    src={"https://cdn-icons-png.flaticon.com/256/3634/3634451.png"}
                    style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '5px',
                    }}
                />
                <em>Ja es poden penjar àudios d'hores de llargada! Però han de ser .mp3 o .wav, si us plau converteix-los abans.</em>
            </div>
        </div>
    );
}

export default FileUploader;