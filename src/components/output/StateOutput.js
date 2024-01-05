import React from 'react';
import doneSound from '../../sounds/bell.wav';
import SideBySide from '../extra/SideBySide';
import localforage from 'localforage';

export const printState = (state, verbose=false) => {
    switch (state) {
        case 0:
            return 'Tria la qualitat i carrega un àudio per començar.';
        case 1:
            return 'Et falta carregar un fitxer àudio.';
        case 2:
            return 'Et falta triar quin tipus de transcripció vols fer.';
        case 3:
            return 'Preparat. Pica "Transcriu" per començar.';
        case 4:
            return 'Processant àudio...';
        case 5:
            return 'Àudio processat. Comença la transcripció...' + (verbose ? ' (aquesta operació pot començar en 5 o 10 minuts en ordinadors de més de 5 anys)' : '');
        case 6:
            return 'Transcripció en curs...';
        case 7:
            return 'Transcripció finalitzada.';
        default:
            return 'Desconegut';
    }
}

const AudioButton = ({ activateFinishAudio, setActivateFinishAudio }) => {
    const handleChange = (event) => {
        setActivateFinishAudio(event.target.checked);
    }

    return (
        <div
            style={{
                flex: 4,
                justifyContent: 'flex-end',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 12,
                padding: 10,
            }}
        >
            <label
                htmlFor="audio"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <input
                    id="audio"
                    type="checkbox"
                    disabled={activateFinishAudio === null}
                    checked={activateFinishAudio || false}
                    onChange={handleChange}
                    style={{
                        width: 10,
                        marginRight: 5,
                    }}
                />
                So al finalitzar
            </label>
        </div>
    )
}

function StateOutput({ state }) {
    const [loadingStep, setLoadingStep] = React.useState(0);
    const [activateFinishAudio, setActivateFinishAudio] = React.useState(null);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingStep(step => (step%3) + 1); // Cycle through 1 to 3
        }, 500); // Update every 500 milliseconds

        return () => {
            clearInterval(intervalId);
        };
    }, [state]);

    React.useEffect(() => {
        if (state === 7 && activateFinishAudio) {
            const audio = new Audio(doneSound);
            audio.play();
        }
    }, [
        state,
    ]);

    React.useEffect(() => {
        if (activateFinishAudio === null) {
            localforage.getItem('activateFinishAudio').then(value => {
                if (value !== null) {
                    setActivateFinishAudio(value);
                } else {
                    setActivateFinishAudio(false);
                }
            });
        } else {
            localforage.setItem('activateFinishAudio', activateFinishAudio);
        }
    }, [
        activateFinishAudio,
    ]);

    const getDisplayText = () => {
        let text = printState(state);
        let dots = '.'.repeat(loadingStep);
        return text.replace('...', dots); // Replace the three dots with the animated version
    }

    const showAudioButton = true // 3 < state && state < 7;

    return (
        <div>
            <div className={'output'}>
                <SideBySide>
                    <div
                        style={{
                            flex: 1,
                            background: '#555',
                            color: 'white',
                            padding: 10,
                            borderRadius: '5px 0 0 5px',
                        }}
                    >
                        SISTEMA:
                    </div>
                    <div
                        style={{
                            flex: 8,
                            padding: 10,
                        }}
                    >
                        {getDisplayText()}
                    </div>
                    { showAudioButton && <AudioButton
                        activateFinishAudio={activateFinishAudio}
                        setActivateFinishAudio={setActivateFinishAudio}
                    /> }
                </SideBySide>
            </div>
        </div>
    );
}

export default StateOutput;