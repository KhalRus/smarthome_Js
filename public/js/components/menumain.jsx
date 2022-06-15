import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { optLine1, optLine2, optLine3, optBar1, changeTitle } from '../sh_lib.js';
import { T_CPU, LOAD_AVG, T_MB, T_HDD, LOAD_RAM, USED_SWAP, NET_TX_H, NET_RX_H, T_ROOM1, T_SERVBOX, T_OUTSIDE, LAST_IND } from '../sh_const.js';

function MenuMain() {
  const [series1, setSeries1] = useState([]);
  const [series2, setSeries2] = useState([]);
  const [series3, setSeries3] = useState([]);
  const [series4, setSeries4] = useState([]);

  function setChart(dat) {
    let arrGraph = [];
    for (let i = 0; i <= LAST_IND; i++) { arrGraph.push([]) };

    dat.forEach(d => {  // распределение данных по отдельным подмассивам
      arrGraph[d.param].push([d.time, d.value]);
    });

    setSeries1([{
      name: 'CPU',
      data: arrGraph[T_CPU]
    }, {
      name: 'Mother board',
      data: arrGraph[T_MB]
    }, {
      name: 'HDD',
      data: arrGraph[T_HDD]
    }]);

    setSeries2([{
      name: 'Дом',
      data: arrGraph[T_ROOM1]
    }, {
      name: 'Серв. шкаф',
      data: arrGraph[T_SERVBOX]
    }, {
      name: 'Улица',
      data: arrGraph[T_OUTSIDE]
    }]);

    setSeries3([{
      name: 'RAM (Mb)',
      data: arrGraph[LOAD_RAM]
    }, {
      name: 'loadAvg',
      data: arrGraph[LOAD_AVG]
    }, {
      name: 'Swap (Mb)',
      data: arrGraph[USED_SWAP]
    }]);

    setSeries4([{
      name: 'Tx',
      data: arrGraph[NET_TX_H]
    }, {
      name: 'Rx',
      data: arrGraph[NET_RX_H]
    }]);
  }

  useEffect(() => {
    fetch('/qServDay')
      .then(res => res.json())
      .then(dat => setChart(dat))
      .catch(err => console.log(err))
  }, []);

  return <div className="grid4">
    <div className="chart">
      <Chart options={changeTitle(optLine1, 'Температура °C')} series={series1} type="line" height="100%" />
    </div>
    <div className="chart">
      <Chart options={changeTitle(optLine2, 'Температура °C')} series={series2} type="line" height="100%" />
    </div>
    <div className="chart">
      <Chart options={changeTitle(optLine3, 'Загрузка сервера')} series={series3} type="line" height="100%" />
    </div>
    <div className="chart">
      <Chart options={changeTitle(optBar1, 'Траффик общий (мегабайт)')} series={series4} type="bar" height="100%" />
    </div>
  </div>;
}

export default MenuMain;