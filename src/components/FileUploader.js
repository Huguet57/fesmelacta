import React, { useState } from 'react';
import { saveFileToIndexedDB } from '../utils/indexedDB';

const FileUploader = ({ processor, success, error }) => {
    const saveFileToDB = async (file) => {
        saveFileToIndexedDB(file);
        success();

        // const reader = new FileReader();
        // reader.onload = async (event) => {
        //     saveFileToIndexedDB(reader.result);
        //     success();
        // };

        // reader.onerror = (event) => {
        //     console.error('Error reading file', event);
        //     error();
        // };

        // reader.readAsArrayBuffer(file);
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        saveFileToDB(file);
    }

    return (
        <input type="file" onChange={handleFileChange} />
    );
}

export default FileUploader;