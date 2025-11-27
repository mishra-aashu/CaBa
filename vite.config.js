import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { securityHeaders } from "vite-plugin-security-headers";

// https://vite.dev/config/
export default defineConfig({
  base: "/CaBa/",
  plugins: [
    react(),
    securityHeaders({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "img-src": ["'self'", "data:", "https:"],
          "connect-src": ["'self'", "https:", "wss:"],
        },
      },
    }),
  ],
})
