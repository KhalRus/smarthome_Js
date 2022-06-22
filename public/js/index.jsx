import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import Chart from 'react-apexcharts';
import { ruLocale } from './sh_lib.js';

Apex.chart = ruLocale;

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <App />
);