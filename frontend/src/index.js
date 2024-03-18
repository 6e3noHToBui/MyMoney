import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from "./reducers"
import { Provider } from 'react-redux';
import { GlobalProvider } from "./context/globalContext"

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </Provider>
);