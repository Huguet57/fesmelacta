function FullAudio({ fullAudio }) {
    return (
        <div
            style={{
                marginTop: '20px',
            }}
        >
            {fullAudio && <audio controls src={fullAudio}></audio>}
        </div>
    )
}

export default FullAudio;