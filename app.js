import express from 'express';
import { loadavg, uptime } from 'os';
import { mongoClient, logString, sets } from './myUtils.js';
import { AL_INFO, AL_WARN, AL_ERR, MSEK_SUT, T_CPU, LOAD_AVG, T_MB, T_HDD, LOAD_RAM, USED_HDD, USED_SWAP, FAN_BOX, FAN_CPU, ERR_HDD,
  NET_TX_H, NET_RX_H, QBIT_TX_H, QBIT_RX_H, NET_TX_D, NET_RX_D, QBIT_TX_D, QBIT_RX_D, T_ROOM1, T_SERVBOX, T_OUTSIDE, LAST_IND, TIME_START } from './public/js/sh_const.js';

const app = express();
app.use(express.static('./public'));

async function initApp() {
  try {
    await app.listen(3000);
    logString(Date.now(), AL_INFO, 'Сервер ожидает подключения..');
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
}

app.get('/senddata', async (req, res) => {        // записываем полученные данные температуры в sets с текущей меткой времени
  function checkMegaData(time, ind, tempC) {      // функция проверки: если данные от меги корректные, то пишем в массив, иначе выводим в лог ошибку
    if ( (tempC > -100) && (tempC < 80) ) {
      sets[ind].val = tempC;
      sets[ind].currTime = time;
    } else {
      logString(time, AL_WARN, `Сбой данных ардуино: ${sets[ind].tag} = ${tempC}`);
    }
  }

  if (req.query.tRoom1) {
    let currTime = Date.now();
    checkMegaData(currTime, T_ROOM1, +req.query.tRoom1);
    checkMegaData(currTime, T_SERVBOX, +req.query.tBox);
    checkMegaData(currTime, T_OUTSIDE, +req.query.tOutside);
  }
  res.send('#$dat transfer response');  // болванка, потом будут передаваться команды управления для Меги
});

app.get('/qServDay', async (req, res) => {
  const collection = mongoClient.db("smarthome").collection("server");
  const qTime = Date.now() - MSEK_SUT / 2;
  try {
    const dat = await collection.find({ time: { $gt: qTime } }).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/qTraffSut', async (req, res) => {
  const collection = mongoClient.db("smarthome").collection("server");
  const qTime = Date.now() - MSEK_SUT;
  try {
    const dat = await collection.find({ time: { $gt: qTime }, param: { $in: [NET_TX_H, NET_RX_H, QBIT_TX_H, QBIT_RX_H] } }).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/qServTempSut', async (req, res) => {
  const collection = mongoClient.db("smarthome").collection("server");
  const qTime = Date.now() - MSEK_SUT;
  try {
    const dat = await collection.find({ time: { $gt: qTime }, param: { $in: [T_CPU, T_MB, T_HDD, T_SERVBOX, FAN_CPU, FAN_BOX] } }).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/qTraffMes', async (req, res) => {
  const collection = mongoClient.db("smarthome").collection("server");
  const qTime = Date.now() - MSEK_SUT * 30;
  try {
    const dat = await collection.find({ time: { $gt: qTime }, param: { $in: [NET_TX_D, NET_RX_D, QBIT_TX_D, QBIT_RX_D] } }).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/qTempMes', async (req, res) => {
  const collection = mongoClient.db("smarthome").collection("server");
  const qTime = Date.now() - MSEK_SUT * 30;
  try {
    const dat = await collection.find({ time: { $gt: qTime }, param: { $in: [T_CPU, T_MB, T_HDD, T_ROOM1, T_SERVBOX, T_OUTSIDE] } }).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/qInfoBar', async (req, res) => {
  function sekToTimeStr(sek) {  // форматирование времени в секундах в DD HH:MM:SS
    let ost = Math.trunc(sek) % (3600 * 24);
    let dd = Math.trunc(sek / (3600 * 24));

    let hh = Math.trunc(ost / 3600);
    if (hh < 10) hh = '0' + hh;
    ost = ost % 3600;

    let mm = Math.trunc(ost / 60);
    if (mm < 10) mm = '0' + mm;

    let ss = ost % 60;
    if (ss < 10) ss = '0' + ss;

    return `${dd}d ${hh}:${mm}:${ss}`;
  }

  try {
    let la = `[${loadavg()[0]}, ${loadavg()[1]}, ${loadavg()[2]}]`;
    let ut = uptime();
    let apTime = Math.trunc((Date.now() - sets[TIME_START].val) / 1000);  // выводим время работы приложения

    let dat = {
      load:       la,
      sysUptime:  sekToTimeStr(ut),
      appUptime:  sekToTimeStr(apTime),
      usedRam:    sets[LOAD_RAM].val,
      tCpu:       sets[T_CPU].val,
      tMb:        sets[T_MB].val,
      tHdd:       sets[T_HDD].val,
      tOutside:   sets[T_OUTSIDE].val,
      tRoom1:     sets[T_ROOM1].val,
      tBox:       sets[T_SERVBOX].val,
      usedHdd:    sets[USED_HDD].val,
      usedSwap:   sets[USED_SWAP].val
    };

    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

initApp();

process.on('SIGINT', async () => {      // прослушиваем прерывание работы программы (ctrl-c)
  await mongoClient.close();
  console.log('');
  logString(Date.now(), AL_INFO, 'Программа и БД MongoDB закрыты!');
  process.exit();
});