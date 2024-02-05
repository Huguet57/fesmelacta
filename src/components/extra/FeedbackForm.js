import React, { useState } from 'react';

const FeedbackForm = () => {
    const [suggestion, setSuggestion] = useState('');
    const [buttonText, setButtonText] = useState('Enviar feedback anònim');

    const sendEmail = async () => {
        if (suggestion !== "") {
            const url = atob("aHR0cHM6Ly9hb2hzNGRncng0LmV4ZWN1dGUtYXBpLmV1LXdlc3QtMy5hbWF6b25hd3MuY29tL1N0YWdlL1NlbmRTdWdnZXN0aW9uVmlhRW1haWxQeXRob24=");
            const api_key = atob("Y0ttajZmajU3RzJ5b3JmVXVhdndoajQwUHBMV3poYzhRNm03");

            try {
                setSuggestion('');
                setButtonText('Enviat!');

                await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': api_key
                    },
                    body: JSON.stringify({ message: suggestion })
                });

                setTimeout(() => setButtonText('Enviar feedback anònim'), 2000);
            } catch (error) {
                console.error('Error sending feedback:', error);
            }
        }
    };

    return (
        <div style={{ backgroundColor: '#f2f2f2', padding: '20px', marginTop: '20px', borderRadius: '5px' }}>
            <h4>Volem el teu feedback!</h4>
            <textarea
                id="suggestionBox"
                placeholder="Tens suggerències? Què és el que més et molesta? Si us plau, dona'ns feedback per poder millorar l'aplicatiu..."
                style={{ marginTop: 0, width: '95%', height: '50px', marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '12px' }}
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
            />
            <button
                id="sendSuggestion"
                onClick={sendEmail}
                style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', textAlign: 'center', textDecoration: 'none', display: 'inline-block', fontSize: '12px', margin: '4px 2px', cursor: 'pointer' }}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default FeedbackForm;