function SideBySide({ children, gap = 5, justifyContent = 'flex-start' }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: `${gap}px`,
                justifyContent: justifyContent,
            }}
        >
            {children}
        </div>
    );
}

export default SideBySide;