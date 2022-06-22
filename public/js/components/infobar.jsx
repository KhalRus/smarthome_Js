import React, { useState, useEffect } from 'react';

function InfoBar() {
  const [info, setInfo] = useState({});
  let timerId;

  function getInfo() {
    fetch('/qInfoBar')
      .then(res => res.json())
      .then(dat => setInfo(dat))
      .catch(err => console.log(err));
  }

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    timerId = setInterval(getInfo, 4000);
    return () => {
      clearInterval(timerId);
    }
  }, []);

  return <div className="bar">
    <div className="barStr">
      <span>Темп. Улица</span>
      <span>{info.tOutside}°</span>
    </div>
    <div className="barStr">
      <span>Темп. Дом</span>
      <span>{info.tRoom1}°</span>
    </div>
    <div className="barStr">
      <span>Темп. Серв.</span>
      <span>{info.tBox}°</span>
    </div>
    <hr />
    <div className="barStr">
      <span>Темп. CPU</span>
      <span>{info.tCpu}°</span>
    </div>
    <div className="barStr">
      <span>Темп. HDD</span>
      <span>{info.tHdd}°</span>
    </div>
    <div className="barStr">
      <span>Темп. MB</span>
      <span>{info.tMb}°</span>
    </div>
    <div className="barStr">
      <span>HDD исп.</span>
      <span>{info.usedHdd}%</span>
    </div>
    <div className="barStr">
      <span>ОЗУ исп.</span>
      <span>{info.usedRam} МБ</span>
    </div>
    <div className="barStr">
      <span>Swap исп.</span>
      <span>{info.usedSwap} МБ</span>
    </div>
    <hr />
    <div className="barStr">
      <span>Загрузка серв.</span>
      <span>{info.load}</span>
    </div>
    <div className="barStr">
      <span>Вр. раб. серв.</span>
      <span>{info.sysUptime}</span>
    </div>
    <div className="barStr">
      <span>Вр. раб. прилож.</span>
      <span>{info.appUptime}</span>
    </div>
  </div>;
}

export default InfoBar;