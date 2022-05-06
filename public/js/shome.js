import {T_CPU, LOAD_AVG, T_MB, T_HDD, LOAD_RAM, USED_HDD, USED_SWAP, FAN_BOX, FAN_CPU, ERR_HDD, NET_TX_H, NET_RX_H, QBIT_TX_H, QBIT_RX_H,
  NET_TX_D, NET_RX_D, QBIT_TX_D, QBIT_RX_D, T_ROOM1, T_SERVBOX, T_OUTSIDE } from './sh_const.js';

Apex.chart = {       // добавление русского языка
  locales: [
    {
      "name": "ru",
      "options": {
        "months": [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь"
        ],
        "shortMonths": [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Ноя",
          "Дек"
        ],
        "days": [
          "Воскресенье",
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота"
        ],
        "shortDays": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        "toolbar": {
          "exportToSVG": "Сохранить SVG",
          "exportToPNG": "Сохранить PNG",
          "exportToCSV": "Сохранить CSV",
          "menu": "Меню",
          "selection": "Выбор",
          "selectionZoom": "Выбор с увеличением",
          "zoomIn": "Увеличить",
          "zoomOut": "Уменьшить",
          "pan": "Перемещение",
          "reset": "Сбросить увеличение"
        }
      }
    }
  ],
  defaultLocale: "ru"
};

const optLine = {    // линейный график
  series: [],
  noData: {
    text: 'Загрузка данных....'
  },
  chart: {
    animations: {
      enabled: true,
      dynamicAnimation: {
        enabled: true,
        speed: 2000
      }
    },
    height: 400,
    type: 'line',
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
    },
    toolbar: {
      show: true
    }
  },
  colors: ['#41c498', '#ce68db', '#77B6EA', '#ecf02e', '#2ace40', '#2638d6', '#df5925', '#ec213c'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth'
  },
  title: {
    text: 'Температура °C',
    align: 'center'
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  markers: {
    size: 0
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    floating: true,
    offsetY: -20,
    offsetX: -5
  },
  tooltip: {
    x: {
      format: 'dd.MM.yy  HH:mm'
    },
  },
};

const optBar = {    // столбчатый график
  series: [],
  noData: {
    text: 'Загрузка данных....'
  },
  title: {
    text: 'Трафик общий (Мегабайт)',
    align: 'center'
  },
  chart: {
    type: 'bar',
    height: 400
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    x: {
      format: 'dd.MM.yy  HH:mm'
    },
  },
/*   tooltip: {
    y: {
      formatter: function (val) {
        return "$ " + val + " thousands"
      }
    }
  } */
};

async function getJson(query) {
  const response = await fetch(query, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  if (response.ok === true) {
    return await response.json();
  } else {
    throw new Error('Ответ не ok');
  }
}

async function renderLastDayData() {
  const dat = await getJson('/lastDay');
  let arrGraph = [];
  for (let i = 0; i <= T_OUTSIDE; i++) { arrGraph.push([]) }

  dat.forEach(d => {  // распределение данных по отдельным подмассивам
    arrGraph[d.param].push([d.time, d.value]);
  });

  await chart1.updateSeries([{  // добавление данных на график (изначально пустой)
    name: 'CPU',
    data: arrGraph[T_CPU]
  }, {
    name: 'Mother board',
    data: arrGraph[T_MB]
  }, {
    name: 'HDD',
    data: arrGraph[T_HDD]
  }]);

  await chart2.updateSeries([{
    name: 'Дом',
    data: arrGraph[T_ROOM1]
  }, {
    name: 'Серв. шкаф',
    data: arrGraph[T_SERVBOX]
  }, {
    name: 'Улица',
    data: arrGraph[T_OUTSIDE]
  }]);

  await chart3.updateSeries([{
    name: 'RAM (Mb)',
    data: arrGraph[LOAD_RAM]
  }, {
    name: 'loadAvg',
    data: arrGraph[LOAD_AVG]
  }, {
    name: 'Swap (Mb)',
    data: arrGraph[USED_SWAP]
  }]);

  await chart4.updateSeries([{
    name: 'Tx',
    data: arrGraph[NET_TX_H]
  }, {
    name: 'Rx',
    data: arrGraph[NET_RX_H]
  }]);
}

let chart1 = new ApexCharts(document.querySelector("#chart1"), optLine);
chart1.render();
let chart2 = new ApexCharts(document.querySelector("#chart2"), optLine);
chart2.render();

optLine.title.text = 'Загрузка системы';      // смена дефолтного заголовка
let chart3 = new ApexCharts(document.querySelector("#chart3"), optLine);
chart3.render();
let chart4 = new ApexCharts(document.querySelector("#chart4"), optBar);
chart4.render();

renderLastDayData();