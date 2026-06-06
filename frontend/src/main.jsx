import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '8px',
            background: '#0f172a',
            color: '#f1f5f9',
            boxShadow: '0 10px 28px -6px rgba(15, 23, 42, 0.35)',
          },
          success: { iconTheme: { primary: '#0e9f6e', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#f05252', secondary: '#f1f5f9' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
