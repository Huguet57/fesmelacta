import { useState } from "react";

function TranscripcioOutput({ initialLines }) {
    const [lines, setLines] = useState(initialLines.filter(l => l));

    const handleTextChange = (event) => {
        // Update the lines state by splitting the new value by new lines
        setLines(event.target.value.split('\n'));
    };

    return (
        <textarea
            placeholder="Aquí apareixerà la transcripció del text."
            value={lines.join('\n')}
            onChange={handleTextChange}
        />
    );
}

export default TranscripcioOutput;