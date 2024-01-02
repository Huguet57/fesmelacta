function FullAudio({ fullAudio }) {
    return (
        <div
            style={{
                marginTop: '20px',
                width: '100%',
            }}
        >
            {fullAudio && <audio
                controls
                src={fullAudio}
                style={{
                    width: '100%',
                }}
            />}
        </div>
    )
}

export default FullAudio;