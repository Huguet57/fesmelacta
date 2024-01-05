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

function StateOutput({ state}) {
    return (
        <div>
            <div
                className={'output'}
            >
                SISTEMA: {printState(state)}
            </div>
        </div>
    );
}

export default StateOutput;