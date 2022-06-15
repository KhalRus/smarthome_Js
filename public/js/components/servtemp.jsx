import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { optLine1, optLine2, changeTitle } from '../sh_lib.js';
import { T_CPU, T_MB, T_HDD, FAN_BOX, FAN_CPU, T_SERVBOX, LAST_IND } from '../sh_const.js';

function ServTempSut() {
  const [series1, setSeries1] = useState([]);
  const [series2, setSeries2] = useState([]);

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
        name: 'Box',
      data: arrGraph[T_SERVBOX]
    }, {
      name: 'HDD',
      data: arrGraph[T_HDD]
    }]);

    setSeries2([{
      name: 'CPU',
      data: arrGraph[FAN_CPU]
    }, {
      name: 'Box',
      data: arrGraph[FAN_BOX]
    }]);
  }

  useEffect(() => {
    fetch('/qServTempSut')
      .then(res => res.json())
      .then(dat => setChart(dat))
      .catch(err => console.log(err))
  }, []);

  return <div className="grid2">
    <div className="chart">
      <Chart options={changeTitle(optLine1, 'Температура °C')} series={series1} type="line" height="100%" />
    </div>
    <div className="chart">
      <Chart options={changeTitle(optLine2, 'Вентиляторы (rpm)')} series={series2} type="line" height="100%" />
    </div>
  </div>;
}

export default ServTempSut;