import React, { useState } from 'react';

const Processor = ({ processor, state }) => {
    const isReady = state === 3 || state === 7;

    const handleClick = () => {
        if (isReady) {
            processor?.process();
        }
    };

    return (
        <button onClick={handleClick} disabled={!isReady}>
            Transcriu
        </button>
    );
};

export default Processor;
