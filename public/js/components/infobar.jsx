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
    <div className="barStr">
      <span>ОЗУ исп.</span>
      <span>{info.usedRam} МБ.</span>
    </div>
  </div>;
}

export default InfoBar;