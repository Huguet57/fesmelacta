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
    );
}

export default FileUploader;