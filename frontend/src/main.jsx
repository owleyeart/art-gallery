import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { SiteConfigProvider } from './context/SiteConfigContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteConfigProvider>
          <App />
        </SiteConfigProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
