function StateOutput({ state}) {
    const printState = (state) => {
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
                return 'Àudio processat. Comença la transcripció...';
            case 6:
                return 'Transcripció en curs...';
            case 7:
                return 'Transcripció finalitzada';
            default:
                return 'Desconegut';
        }
    }

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