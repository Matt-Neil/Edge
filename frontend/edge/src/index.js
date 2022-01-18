import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import OpenWorkspacesContextProvider from './Contexts/openWorkspacesContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';

ReactDOM.render(
  <React.StrictMode>
    <CurrentUserContextProvider>
      <OpenWorkspacesContextProvider>
        <App />
      </OpenWorkspacesContextProvider>
    </CurrentUserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
