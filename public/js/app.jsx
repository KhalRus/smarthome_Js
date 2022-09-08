import React, { useState, useEffect } from 'react';
import { slide as Burger } from 'react-burger-menu'

import MenuMain from './components/menumain.jsx';
import TraffSut from './components/traffsut.jsx';
import TraffMes from './components/traffmes.jsx';
import AppInfo from './components/appinfo.jsx';
import InfoBar from './components/infobar.jsx';
import ServTempSut from './components/servtemp.jsx';
import MenuButton from './components/menubutton.jsx';
import TempMes from './components/tempmes.jsx';
import BurgerButton from './components/burgerbutton.jsx';

function App() {
  const [nMenu, setMenu] = useState(0);
  const [burgOpen, setBurgOpen] = useState(false);
  const [cHeight, setCHeight] = useState(350);

  useEffect(() => {  // вычисление высоты поля графика
    let w = window.innerWidth;
    let h;
    if (w < 900) {
      h = Math.trunc(w / 1.77);
    } else if (w < 1400) {
      h = Math.trunc((w - 300) / 1.77);
    } else {
      h = Math.trunc((window.innerHeight - 175) / 2);
    }
    setCHeight(h);
  });

  function closeMenu(num) {
    setBurgOpen(false);
    setMenu(num);
  }

  function handleBurgStateChange(state) {
    setBurgOpen(state.isOpen);
  }

  let mainChart;
  switch (nMenu) {
    case 0:
      mainChart = <MenuMain height={cHeight} />;
      break;
    case 1:
      mainChart = <TraffSut height={cHeight} />;
      break;
    case 2:
      mainChart = <TraffMes height={cHeight} />;
      break;
    case 3:
      mainChart = <ServTempSut height={cHeight} />;
      break;
    case 4:
      mainChart = <TempMes height={cHeight} />;
      break;
    case 5:
      mainChart = <AppInfo />;
      break;      
  }

  return (
    <div className="content">
      <div>
        <Burger right width={'73%'} isOpen={burgOpen} onStateChange={(state) => handleBurgStateChange(state)} >
          <BurgerButton num="0" curr={nMenu} func={closeMenu} title="Главная" />
          <BurgerButton num="1" curr={nMenu} func={closeMenu} title="Трафик суточный" />
          <BurgerButton num="2" curr={nMenu} func={closeMenu} title="Трафик месячный" />
          <BurgerButton num="3" curr={nMenu} func={closeMenu} title="Сервер t сутки" />
          <BurgerButton num="4" curr={nMenu} func={closeMenu} title="Температура за месяц" />
          <BurgerButton num="5" curr={nMenu} func={closeMenu} title="О проекте" />
        </Burger>
        <div className="menuInfo">
          <MenuButton num="0" curr={nMenu} func={setMenu} title="Главная" />
          <MenuButton num="1" curr={nMenu} func={setMenu} title="Трафик суточный" />
          <MenuButton num="2" curr={nMenu} func={setMenu} title="Трафик месячный" />
          <MenuButton num="3" curr={nMenu} func={setMenu} title="Сервер t сутки" />
          <MenuButton num="4" curr={nMenu} func={setMenu} title="Температура за месяц" />
          <MenuButton num="5" curr={nMenu} func={setMenu} title="О проекте" />
        </div>
        <InfoBar />
      </div>
      <div>
        {mainChart}
      </div>
    </div>
  );
}

export default App;