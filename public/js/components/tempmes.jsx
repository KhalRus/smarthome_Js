import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { optLine1, optLine2, changeOptions } from '../sh_lib.js';
import { T_CPU, T_MB, T_HDD, T_ROOM1, T_SERVBOX, T_OUTSIDE, LAST_IND } from '../sh_const.js';

function TempMes(props) {
  const [series1, setSeries1] = useState([]);
  const [series2, setSeries2] = useState([]);

  function setChart(dat) {
    let arrGraph = [];
    let prevData = [];
    let lastData = [];
    for (let i = 0; i <= LAST_IND; i++) {
      arrGraph.push([]);
      prevData.push(-100);
      lastData.push(0);
    };

    dat.forEach(d => {  // распределение данных по отдельным подмассивам
      let delt = 1;
      if (d.param == T_CPU) delt = 2;

      if ( Math.abs(d.value - prevData[d.param]) >= delt ) {  // фильтруем незначительные для мес. графика отклонения, для ускорения отрисовки
        arrGraph[d.param].push([d.time, d.value]);
        prevData[d.param] = d.value;
      }
      lastData[d.param] = [d.time, d.value];
    });

    for (let i = 0; i <= LAST_IND; i++) {  // записываем последние данные, чтобы не обрезались крайние значения на графике
      arrGraph[i].push(lastData[i]);
    }


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
  }

  useEffect(() => {
    fetch('/qTempMes')
      .then(res => res.json())
      .then(dat => setChart(dat))
      .catch(err => console.log(err))
  }, []);

  return <div className="grid2">
    <div className="chart">
      <Chart options={changeOptions(optLine1, 'Температура °C', props.height)} series={series1} type="line" height={props.height} />
    </div>
    <div className="chart">
      <Chart options={changeOptions(optLine2, 'Температура °C', props.height)} series={series2} type="line" height={props.height} />
    </div>
  </div>;
}

export default TempMes;