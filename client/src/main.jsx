import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { App } from './App';
import './styles.css';
import { MenuProvider } from './context/MenuContext';
import { OrderSelectionProvider } from './context/OrderSelectionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MenuProvider>
          <OrderSelectionProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  boxShadow: '0 20px 60px rgba(2, 6, 23, 0.35)'
                }
              }}
            />
          </OrderSelectionProvider>
        </MenuProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
