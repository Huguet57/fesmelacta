const ProgressBar = ({ progress }) => {
    const containerStyles = {
        height: 20,
        width: '100%',
        backgroundColor: '#e0e0de',
        borderRadius: 4, // Less pronounced border-radius to fit the flat design
        overflow: 'hidden', // Ensure the filler doesn't overflow the container
        marginTop: '10px',
    };

    const fillerStyles = {
        height: '100%',
        width: `${progress.toFixed(1)}%`,
        backgroundColor: '#4CAF50', // A green shade similar to the button in the screenshot
        textAlign: 'center',
        transition: 'width 0.5s ease-in-out',
        display: 'flex',
        alignItems: 'center', // Center the label vertically
        justifyContent: 'flex-end',
        whiteSpace: 'nowrap', // Prevent the label from wrapping
        color: 'white', // Text color that stands out
        fontWeight: 'bold',
        fontSize: '10px',
        paddingRight: '5px',
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                {progress < 100 ? `${progress.toFixed(2)}%` : 'Completed'} 
            </div>
        </div>
    );
};

export default ProgressBar;