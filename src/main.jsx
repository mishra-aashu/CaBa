import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ChatThemeProvider } from './contexts/ChatThemeContext.jsx'
import { SupabaseProvider } from './contexts/SupabaseContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider>
          <ChatThemeProvider>
            <App />
          </ChatThemeProvider>
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  </StrictMode>,
)
