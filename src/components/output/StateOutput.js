import React from 'react';

export const printState = (state, verbose=false) => {
    switch (state) {
        case 0:
            return 'Falta triar quin tipus de transcripció vols fer i carregar un àudio';
        case 1:
            return 'Falta carregar un àudio';
        case 2:
            return 'Falta triar quin tipus de transcripció vols fer';
        case 3:
            return 'Preparat.';
        case 4:
            return 'Processant àudio...';
        case 5:
            return 'Àudio processat. Comença la transcripció...' + (verbose ? ' (aquesta operació pot començar en 5 o 10 minuts en ordinadors de més de 5 anys)' : '');
        case 6:
            return 'Transcripció en curs...';
        case 7:
            return 'Transcripció finalitzada';
        default:
            return 'Desconegut';
    }
}

function StateOutput({ state }) {
    const [loadingStep, setLoadingStep] = React.useState(0);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingStep(step => (step%3) + 1); // Cycle through 1 to 3
        }, 400); // Update every 400 milliseconds

        return () => {
            clearInterval(intervalId);
        };
    }, [state]);

    const getDisplayText = () => {
        let text = printState(state);
        let dots = '.'.repeat(loadingStep);
        return text.replace('...', dots); // Replace the three dots with the animated version
    }

    return (
        <div>
            <div className={'output'}>
                SISTEMA: {getDisplayText()}
            </div>
        </div>
    );
}

export default StateOutput;