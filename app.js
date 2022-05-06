import express from 'express';
import { mongoClient, logString, sets } from './myUtils.js';
import { T_ROOM1, T_SERVBOX, T_OUTSIDE, AL_INFO, AL_WARN, AL_ERR } from './public/js/sh_const.js';

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

app.get('/lastDay', async (req, res) => {
  const collection = mongoClient.db("smarthome2").collection("server");
  const lastDayTime = Date.now() - 86_400_000 / 2;
  try {
    const dat = await collection.find( { time: {$gt: lastDayTime} } ).toArray();
    res.send(dat);
  } catch (e) {
    logString(Date.now(), AL_ERR, e.toString());
  }
});

app.get('/senddata', async (req, res) => {        // записываем полученные данные температуры в sets с текущей меткой времени
  function checkMegaData(time, ind, tempC) {      // функция проверки: если данные от меги корректные, то пишем в массив, иначе выводим в лог ошибку
    if ( (tempC > -100) && (tempC < 80) ) {
      sets[ind].val = tempC;
      sets[ind].currTime = time;
    } else {
      logString(time, AL_WARN, `Сбой данных ардуино: ${sets[ind].tag} = ${tempC}`);
    }
  }

  let currTime = Date.now();
  checkMegaData(currTime, T_ROOM1, +req.query.tRoom1);
  checkMegaData(currTime, T_SERVBOX, +req.query.tBox);
  checkMegaData(currTime, T_OUTSIDE, +req.query.tOutside);

  res.send('#$dat transfer response');
});

initApp();

process.on('SIGINT', async () => {      // прослушиваем прерывание работы программы (ctrl-c)
  await mongoClient.close();
  console.log('');
  logString(Date.now(), AL_INFO, 'Программа и БД MongoDB закрыты!');
  process.exit();
});