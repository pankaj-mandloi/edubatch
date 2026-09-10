import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

console.log('🚀 Main.jsx loading...');

const rootElement = document.getElementById('root');
console.log('📦 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </BrowserRouter>
      </React.StrictMode>,
    );
    console.log('✅ React rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React:', error);
    // Show error on screen
    rootElement.innerHTML = `
      <div style="padding:20px;font-family:sans-serif;color:red;">
        <h2>Error Loading Application</h2>
        <pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${error.message}</pre>
        <p>Check console for details</p>
      </div>
    `;
  }
}