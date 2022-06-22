import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { optBar1, optBar2, changeOptions } from '../sh_lib.js';
import { NET_TX_D, NET_RX_D, QBIT_TX_D, QBIT_RX_D, LAST_IND } from '../sh_const.js';

function TraffMes(props) {
  const [series1, setSeries1] = useState([]);
  const [series2, setSeries2] = useState([]);

  function setChart(dat) {
    let arrGraph = [];
    for (let i = 0; i <= LAST_IND; i++) { arrGraph.push([]) };

    dat.forEach(d => {  // распределение данных по отдельным подмассивам
      arrGraph[d.param].push([d.time, d.value]);
    });

    setSeries1([{
      name: 'Tx',
      data: arrGraph[QBIT_TX_D]
    }, {
      name: 'Rx',
      data: arrGraph[QBIT_RX_D]
    }]);

    setSeries2([{
      name: 'Tx',
      data: arrGraph[NET_TX_D]
    }, {
      name: 'Rx',
      data: arrGraph[NET_RX_D]
    }]);
  }

  useEffect(() => {
    fetch('/qTraffMes')
      .then(res => res.json())
      .then(dat => setChart(dat))
      .catch(err => console.log(err))
  }, []);

  return <div className="grid2">
    <div className="chart">
      <Chart options={changeOptions(optBar1, 'Траффик Qbit (мегабайт)', props.height)} series={series1} type="bar" height={props.height} />
    </div>
    <div className="chart">
      <Chart options={changeOptions(optBar2, 'Траффик общий (мегабайт)', props.height)} series={series2} type="bar" height={props.height} />
    </div>
  </div>;
}

export default TraffMes;