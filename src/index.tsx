import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from "./AppRouter";
import { SourceDataProvider } from "./contexts/SourceDataContext";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SourceDataProvider>
      <AppRouter />
    </SourceDataProvider>
  </React.StrictMode>
); 