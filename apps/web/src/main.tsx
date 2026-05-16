import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main>
      <h1>Soundloom Web</h1>
      <p>Frontend kör i apps/web och proxar /api till backend.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
