import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import OpenItemsContextProvider from './Contexts/openItemsContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';
import CardFormatContextProvider from './Contexts/cardFormatContext';

ReactDOM.render(
    <React.StrictMode>
        <CurrentUserContextProvider>
            <OpenItemsContextProvider>
                <CardFormatContextProvider>
                    <App />
                </CardFormatContextProvider>
            </OpenItemsContextProvider>
        </CurrentUserContextProvider>
    </React.StrictMode>,
document.getElementById('root'));