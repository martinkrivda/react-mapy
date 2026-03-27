import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import 'leaflet/dist/leaflet.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to find the playground root element.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
