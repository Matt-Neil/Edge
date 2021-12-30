import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import OpenProjectsContextProvider from './Contexts/openProjectsContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';

ReactDOM.render(
  <React.StrictMode>
    <CurrentUserContextProvider>
      <OpenProjectsContextProvider>
        <App />
      </OpenProjectsContextProvider>
    </CurrentUserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
