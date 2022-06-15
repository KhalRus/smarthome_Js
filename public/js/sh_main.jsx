import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import Chart from 'react-apexcharts';

import { ruLocale } from './sh_lib.js';
import MenuMain from './components/menumain.jsx';
import TraffSut from './components/traffsut.jsx';
import TraffMes from './components/traffmes.jsx';
import ServTempSut from './components/servtemp.jsx';
import InfoBar from './components/infobar.jsx';

Apex.chart = ruLocale;

function Nav() {
  return <nav>
    <NavLink to="/" className="button">Главная</NavLink>
    <NavLink to="/traffsut" className="button">Трафик суточный</NavLink>
    <NavLink to="/traffmes" className="button">Трафик месячный</NavLink>
    <NavLink to="/servtempsut" className="button">Сервер t сутки</NavLink>
    <NavLink to="/appinfo" className="button">О системе</NavLink>
  </nav>;
}

function AppInfo() {
  return <h2>Информация о системе</h2>;
}

function NotFound() {
  return <h2>Страница отсутствует!!</h2>;
}

createRoot(
  document.getElementById("app")
).render(
  <BrowserRouter>
    <div>
      <div className="menuInfo">
        <Nav />
      </div>
      <InfoBar />
    </div>
    <Routes>
      <Route path="/" element={<MenuMain />} />
      <Route path="/traffsut" element={<TraffSut />}/>
      <Route path="/traffmes" element={<TraffMes />} />
      <Route path="/servtempsut" element={<ServTempSut />} />
      <Route path="/appinfo" element={<AppInfo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
