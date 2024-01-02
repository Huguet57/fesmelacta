function FullAudio({ fullAudio }) {
    return (
        <div>
            {fullAudio && <audio controls src={fullAudio}></audio>}
        </div>
    )
}

export default FullAudio;