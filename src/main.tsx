import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/base.css'
import './assets/styles/layout.css'
import './assets/styles/components.css'
import './assets/styles/pages/landing.css'
import './assets/styles/pages/onboarding.css'
import './assets/styles/pages/home.css'
import './assets/styles/pages/care.css'
import './assets/styles/pages/calendar.css'
import './assets/styles/pages/settings.css'
import './assets/styles/pages/diary.css'
import './assets/styles/responsive.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
