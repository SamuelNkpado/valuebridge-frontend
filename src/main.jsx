import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'

// Remove browser default spacing so we don't get side gaps.
document.documentElement.style.margin = '0'
document.documentElement.style.padding = '0'
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.overflowX = 'hidden'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)