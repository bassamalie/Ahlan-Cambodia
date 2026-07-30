import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './LanguageContext.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  console.error("Failed to find root element with id 'root'");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error("Error initializing React application in main.tsx:", error);
    container.innerHTML = `
      <div style="padding: 24px; font-family: system-ui, sans-serif; text-align: center; color: #333;">
        <h2>Unable to load application</h2>
        <p style="color: #666;">A technical issue occurred while initializing. Please refresh the page.</p>
      </div>
    `;
  }
}

