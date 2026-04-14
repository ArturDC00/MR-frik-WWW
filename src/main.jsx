import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ StrictMode USUNIĘTY - powodował double mount useEffect w dev mode
// To zabijało GSAP ScrollTrigger i Canvas (Context Lost)
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)