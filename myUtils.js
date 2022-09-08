import { promisify } from 'util';
import { exec } from 'child_process';
import {readFileSync, appendFileSync} from 'fs';
import {loadavg, homedir} from 'os';
import {get as httpGet} from 'http';
import {get as httpsGet} from 'https';
import { MongoClient } from 'mongodb';

// импорт констант
import {T_CPU, LOAD_AVG, T_MB, T_HDD, LOAD_RAM, USED_HDD, USED_SWAP, FAN_BOX, FAN_CPU, ERR_HDD, NET_TX_H, NET_RX_H, QBIT_TX_H, QBIT_RX_H,
  NET_TX_D, NET_RX_D, QBIT_TX_D, QBIT_RX_D, T_ROOM1, T_SERVBOX, T_OUTSIDE, AL_INFO, AL_WARN, AL_ERR, BYTES_IN_MB, QBIT_URL, TIME_START, LAST_IND} from './public/js/sh_const.js';

export let mongoClient;
export let sets;                                   // массив настроек диагностики, сохранен в Json 'settings.json'

const execPr = promisify(exec);     // функция для запроса данных внешних программ

let tgMess = 'https://api.telegram.org/bot';

// вывод сообщения в лог с меткой времени
export function logString(mTime, mErr, mMess) {
  let currTime = new Date(mTime);
  let outStr = currTime.getFullYear() + '.';

  let td = currTime.getMonth() + 1;
  outStr += (td > 9 ? td : '0' + td) + '.';

  td = currTime.getDate();
  outStr += (td > 9 ? td : '0' + td) + ' ';

  td = currTime.getHours();
  outStr += (td > 9 ? td : '0' + td) + ':';

  td = currTime.getMinutes();
  outStr += (td > 9 ? td : '0' + td) + ':';

  td = currTime.getSeconds();
  outStr += (td > 9 ? td : '0' + td) + ' ';

  if (mErr == AL_INFO) {
    outStr += 'info ';
  } else if (mErr == AL_WARN) {
    outStr += 'warn ';
  } else if (mErr == AL_ERR) {
    outStr += 'err! ';
  }
  appendFileSync('./doc/sh_log.txt', outStr + mMess + '\n', 'utf8');
  console.log(outStr + mMess);
}

// парсим строку, если NaN, бросаем ошибку
function myParseInt(inStr, errStr) {
  let i = parseInt(inStr, 10);
  if ( isNaN(i) ) {
    throw new SyntaxError('Ошибка данных ' + errStr + ': ' + inStr);
  } else {
    return i;
  }
}

// getHttps (getHttp) на промисах, возвращает объект
function promiseGetHt(url) {
  return new Promise( (resolve, reject) => {
    let req;
    function subGet(res) {
      if ( res.statusCode != 200 ) {
        return reject(new Error('statusCode= ' + res.statusCode));
      }
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        resolve( JSON.parse(rawData) );
      });
      req.on('error', (err) => {
        reject(err);
      });
    }

    if ( url.startsWith('https://') ) {
      req = httpsGet(url, subGet);
    } else {
      req = httpGet(url, subGet);
    }
    req.end();
  });
}

// запрос данных состояния сервера и обработка результатов (главная функция)
async function checkServerInfo() {
  let currTimeD = new Date();
  let currTime = currTimeD.getTime();

  try {
    sets[LOAD_AVG].val = Math.round(loadavg()[0] * 100);                                                       // усредненная минутная загрузка системы

    const sfree = (await execPr('free -m')).stdout.split('\n');                                                   // запрос из программы free
    sets[LOAD_RAM].val  = myParseInt(sfree[1].slice(22, 37), sets[LOAD_RAM].tag)
    sets[USED_SWAP].val  = myParseInt(sfree[2].slice(22, 37), sets[USED_SWAP].tag)

    const sens = JSON.parse((await execPr('sensors -j')).stdout);                                                 // запрос из программы lm-sensors
    sets[FAN_BOX].val = sens['nct6776-isa-0290'].fan_Box.fan1_input;
    sets[FAN_CPU].val = sens['nct6776-isa-0290'].fan_CPU.fan2_input;
    sets[T_MB].val = sens['nct6776-isa-0290'].SYSTIN.temp1_input;
    sets[T_CPU].val = sens['coretemp-isa-0000']['Package id 0'].temp1_input;

    // запрашиваем данные Hdd соответственно уставки записи температуры Hdd в базу, т.к. запуск smartctl относительно долгий (около 70 милисек) и смысла нет очень часто запрашивать
    if ( (currTime - sets[T_HDD].prevTime) > sets[T_HDD].deltaTime * 1000 ) {
      const hdd = JSON.parse((await execPr('smartctl /dev/sda -A -H -f brief -j')).stdout);                       // запрос из программы smartctl
      sets[ERR_HDD].val = +!hdd.smart_status.passed;
      sets[T_HDD].val = hdd.temperature.current;

      const uhdd = (await execPr('df -h | grep /sda3')).stdout;                                                   // запрос из программы df
      sets[USED_HDD].val  = myParseInt(uhdd.slice(-7), sets[USED_HDD].tag)
    }

    let trafTimeH, trafTimeD;
    // запрашиваем данные по трафику 1 раз в час и 1 раз в сутки, в 00 минут
    if ( (currTime - sets[NET_RX_H].prevTime) >= sets[NET_RX_H].deltaTime * 1000 ) {
      trafTimeH = ( new Date(currTimeD.getFullYear(), currTimeD.getMonth(), currTimeD.getDate(), currTimeD.getHours() ) ).getTime() - 3600_000;  // время 00 минут прошлого часа, т.к. трафик считается по завершении часа, и относится к прошедшему часу

      const qbit = await promiseGetHt(QBIT_URL);                                                                 // запрос данных от программы Qbittorrent, записываем трафик за прошедший час (разница значений текущее и прошлое)
      sets[QBIT_TX_H].val = Math.round( (qbit.up_info_data - sets[QBIT_TX_H].prevValue) / BYTES_IN_MB);
      sets[QBIT_RX_H].val = Math.round( (qbit.dl_info_data - sets[QBIT_RX_H].prevValue) / BYTES_IN_MB);
      sets[QBIT_TX_H].prevValue = qbit.up_info_data;  // для данных qBit в предыдущее значение пишем прошлое значение трафика
      sets[QBIT_RX_H].prevValue = qbit.dl_info_data;

      const vns = JSON.parse((await execPr('vnstat --json h 1')).stdout).interfaces[0].traffic.hour[0];           // запрос данных от программы vnstat часовой траффик
      sets[NET_TX_H].val = Math.round(vns.tx / BYTES_IN_MB);
      sets[NET_RX_H].val = Math.round(vns.rx / BYTES_IN_MB);

      // запрос суточного трафика
      if ( (currTime - sets[NET_RX_D].prevTime) >= sets[NET_RX_D].deltaTime * 1000 ) {
        trafTimeD = ( new Date(currTimeD.getFullYear(), currTimeD.getMonth(), currTimeD.getDate() ) ).getTime() - 86_400_000;  // время 0:00 прошлого дня, аналогично часовому трафику

        const vnsD = JSON.parse((await execPr('vnstat --json d 1')).stdout).interfaces[0].traffic.day[0];         // запрос данных от программы vnstat суточный траффик
        sets[NET_TX_D].val = Math.round(vnsD.tx / BYTES_IN_MB);
        sets[NET_RX_D].val = Math.round(vnsD.rx / BYTES_IN_MB);

        sets[QBIT_TX_D].val = Math.round( (qbit.up_info_data - sets[QBIT_TX_D].prevValue) / BYTES_IN_MB);
        sets[QBIT_RX_D].val = Math.round( (qbit.dl_info_data - sets[QBIT_RX_D].prevValue) / BYTES_IN_MB);
        sets[QBIT_TX_D].prevValue = qbit.up_info_data;  // для данных qBit в предыдущее значение пишем прошлое значение трафика
        sets[QBIT_RX_D].prevValue = qbit.dl_info_data;
      }
    }

    let mRecs = [];  // массив для записи в БД

    // обработка данных состояния сервера
    for (let i = 0; i <= LAST_IND; i++) {
      // если изменение значения больше уставки дельты или прошлое значение записано давно (больше дельты времени, дельта дана в секундах), то пишем в базу, через массив
      if ( (Math.abs(sets[i].val - sets[i].prevValue) > sets[i].deltaValue) || ( currTime - sets[i].prevTime >= sets[i].deltaTime * 1000 ) ) {
        let tTime;          // для траффика время указывается округленное на начало часа (суток), для температуры время поступл. данных, для остальных показателей - текущее
        if (i < NET_TX_H) {
          tTime = currTime;
        } else if (i < NET_TX_D) {
          tTime = trafTimeH;
        } else if (i < T_ROOM1) {
          tTime = trafTimeD;
        } else {
          tTime = sets[i].currTime;
        }

        mRecs.push({
          time: tTime,
          param: i,
          value: sets[i].val
        });
        sets[i].prevTime = tTime;

        if ( (i < NET_TX_H) || (i > QBIT_RX_D) ) {    // предыдущее значение для трафика не пишем, т.к. для qBit там пишется текущий нарастающий трафик, а для общего сетевого трафика (vnstat) это не нужно
          sets[i].prevValue = sets[i].val;
        }
      }

      // если значение вышло за границы (только что), то пишем в лог и если надо, то СМС в телегу
      if ( (sets[i].val < sets[i].min) || (sets[i].val > sets[i].max) ) {
        if (!sets[i].warn) {
          let tStr = 'Значение ' + sets[i].tag + ' вышло за пределы: ' + sets[i].val;
          logString(currTime, AL_WARN, tStr);
          sets[i].warn = true;

          if (sets[i].sms) {        // смс в телегу
            let tgDat = await promiseGetHt(tgMess + tStr);
            if (!tgDat.ok) logString(currTime, AL_WARN, 'Ошибка отправки СМС в телеграмм!!');
          }
        }
      } else if (sets[i].warn) {  // значение вернулось в норму
        let tStr = 'Значение ' + sets[i].tag + ' в норме: ' + sets[i].val;
        logString(currTime, AL_INFO, tStr);
        sets[i].warn = false;

        if (sets[i].sms) {
          let tgDat = await promiseGetHt(tgMess + tStr);
          if (!tgDat.ok) logString(currTime, AL_WARN, 'Ошибка отправки СМС в телеграмм!!');
        }
      }
    }

    // запись в БД массива
    if (mRecs.length > 0) {
      await mongoClient.db("smarthome").collection("server").insertMany(mRecs);
    }

  } catch (e) {
    logString(currTime, AL_ERR, e.toString());
  }
}

// инициализация модуля
async function initModule() {
  let currTimeD = new Date();
  let currTime = currTimeD.getTime();

  try {
    sets = JSON.parse(readFileSync('./doc/settings.json', 'utf8'), (key, val) => {
      if (val == 'Infinity') return Infinity;  // т.к. в Json нет Infinity, то заменяем вручную
      return val;
    });

    sets[TIME_START].val = currTime;  // время запуска сервера

    sets[T_ROOM1].prevTime = currTime;                    // чтобы не записать в БД начальные значения
    sets[T_SERVBOX].prevTime = currTime;
    sets[T_OUTSIDE].prevTime = currTime;

    let initTime = ( new Date(currTimeD.getFullYear(), currTimeD.getMonth(), currTimeD.getDate(), currTimeD.getHours()) ).getTime() - 3600_000;  // чтобы первый запрос H трафика был в начале следующего часа
    sets[NET_TX_H].prevTime = initTime;
    sets[NET_RX_H].prevTime = initTime;
    sets[QBIT_TX_H].prevTime = initTime;
    sets[QBIT_RX_H].prevTime = initTime;

    initTime = ( new Date(currTimeD.getFullYear(), currTimeD.getMonth(), currTimeD.getDate()) ).getTime() - 86_400_000;  // чтобы первый запрос D трафика был в начале следующих суток
    sets[NET_TX_D].prevTime = initTime;
    sets[NET_RX_D].prevTime = initTime;
    sets[QBIT_TX_D].prevTime = initTime;
    sets[QBIT_RX_D].prevTime = initTime;

    let setsApp = JSON.parse(readFileSync(homedir() + '/doc/smarthome/sett.json', 'utf8'));               // настройки телеги, пароли БД
    tgMess = tgMess + setsApp.tg_token + '/sendMessage?chat_id=' + setsApp.tg_chat + '&parse_mode=html&text=';

    mongoClient = new MongoClient(setsApp.mongodb);
    await mongoClient.connect();
    logString(currTime, AL_INFO, 'БД MongoDB подключена!');
  } catch (e) {
    logString(currTime, AL_ERR, e.toString());
  }
}

initModule();

setInterval(checkServerInfo, 10000);   // запрос данных сервера раз в 10 секунд