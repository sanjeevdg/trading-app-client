import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { WatchlistProvider } from "./context/WatchlistContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WatchlistProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </WatchlistProvider>
  </React.StrictMode>
)
