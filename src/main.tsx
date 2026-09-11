import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { registerStarterPlanSeeding } from './services/seed.service';
import './index.css';

registerStarterPlanSeeding();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
