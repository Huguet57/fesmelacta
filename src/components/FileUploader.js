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
            <label htmlFor="file">Fitxer d'àudio: </label>
            <input disabled={isDisabled} type="file" onChange={handleFileChange} accept="audio/wav,audio/mpeg,audio/ogg" />

            <div
                style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <em>Ja es poden penjar àudios d'hores de llargada! Però han de ser .mp3 o .wav, si us plau converteix-los abans.</em>
            </div>
        </div>
    );
}

export default FileUploader;