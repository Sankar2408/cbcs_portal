import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Main App component
import './index.css';  // Global styles (optional)
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
