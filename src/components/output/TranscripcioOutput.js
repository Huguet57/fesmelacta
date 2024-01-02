function TranscripcioOutput({ lines }) {
    return (
        <textarea
            placeholder="Aquí apareixerà la transcripció del text."
        >
            {
                lines.join('\n')
            }
        </textarea>
    );
}

export default TranscripcioOutput;