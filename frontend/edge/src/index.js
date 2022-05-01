import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import OpenItemsContextProvider from './Contexts/openItemsContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';
import CardFormatContextProvider from './Contexts/cardFormatContext';
import MessageContextProvider from './Contexts/messageContext';

ReactDOM.render(
    <React.StrictMode>
        {/* Wraps all context providers around the application to be accessed */}
        <CurrentUserContextProvider>
            <OpenItemsContextProvider>
                <CardFormatContextProvider>
                    <MessageContextProvider>
                        <App />
                    </MessageContextProvider>
                </CardFormatContextProvider>
            </OpenItemsContextProvider>
        </CurrentUserContextProvider>
    </React.StrictMode>,
document.getElementById('root'));