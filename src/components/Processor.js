import React, { useState } from 'react';

const Processor = ({ processor, isAudioLoaded, isModelLoaded }) => {
    const handleClick = () => {
        if (isAudioLoaded && isModelLoaded) {
            processor?.process();
        }
    };

    return (
        <button onClick={handleClick} disabled={!isAudioLoaded || !isModelLoaded}>
            Transcriu
        </button>
    );
};

export default Processor;
