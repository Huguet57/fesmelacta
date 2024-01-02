function TranscripcioOutput({ lines }) {
    return (
        <textarea
            placeholder="Aquí apareixerà la transcripció del text."
            value={lines.join('\n')}
        />
    );
}

export default TranscripcioOutput;