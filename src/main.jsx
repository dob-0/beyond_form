import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import favicon from '../assets/favicon.png'
import './styles.css'

const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/png'
link.href = favicon
document.head.appendChild(link)

createRoot(document.getElementById('root')).render(<App />)
