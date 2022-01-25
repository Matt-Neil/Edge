import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import OpenItemsContextProvider from './Contexts/openItemsContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';

ReactDOM.render(
  <React.StrictMode>
    <CurrentUserContextProvider>
      <OpenItemsContextProvider>
        <App />
      </OpenItemsContextProvider>
    </CurrentUserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
