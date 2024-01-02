import { useState } from "react";

function TranscripcioOutput({ lines }) {
    return (
        <textarea
            placeholder="Aquí apareixerà la transcripció del text."
            value={lines.filter(l => l !== '').join('\n')}
        />
    );
}

export default TranscripcioOutput;