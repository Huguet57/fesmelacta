function TranscripcioOutput({ lines }) {
    return (
        <textarea
            placeholder="Esperant la transcripció..."
        >
            {
                lines.join('\n')
            }
        </textarea>
    );
}

export default TranscripcioOutput;