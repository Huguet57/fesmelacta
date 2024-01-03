function AudioParts({ audioParts }) {
    return (
        <div className="audio-parts">
            {
                audioParts.map((audio, index) => (
                    <audio key={index} controls src={audio} />
                ))
            }
        </div>
    );
}

export default AudioParts;