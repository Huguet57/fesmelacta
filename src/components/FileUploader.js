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
        <div>
            <label for="file">Fitxer d'àudio:</label>
            <input disabled={isDisabled} type="file" onChange={handleFileChange} accept="audio/wav,audio/mpeg" />
        </div>
    );
}

export default FileUploader;