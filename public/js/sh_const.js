// константы данных, для массива sets и БД
export const T_CPU  = 0,
  LOAD_AVG  = 1,
  T_MB   = 2,
  T_HDD  = 3,
  LOAD_RAM  = 4,
  USED_HDD  = 5,
  USED_SWAP = 6,
  FAN_BOX  = 7,
  FAN_CPU  = 8,
  ERR_HDD = 9,
  NET_TX_H = 10,
  NET_RX_H = 11,
  QBIT_TX_H = 12,
  QBIT_RX_H = 13,
  NET_TX_D = 14,
  NET_RX_D = 15,
  QBIT_TX_D = 16,
  QBIT_RX_D = 17,
  T_ROOM1 = 18,
  T_SERVBOX = 19,
  T_OUTSIDE = 20,
  TIME_START = 21,
  LAST_IND = 20,

  // константы логов
  AL_INFO  = 0,
  AL_WARN  = 1,
  AL_ERR  = 2,

  // константы в байтах
  BYTES_IN_MB  = 1_048_576,

  // запрос данных QbitTorrent
  QBIT_URL = 'http://localhost:8080/query/transferInfo',

  MSEK_SUT = 86_400_000;  // милисекунд в сутках

// const TOTAL_RAM  = 4_015_362_048;
// const TOTAL_HDD  = 3_932_681_388_032;
// const TOTAL_SWAP = 4_294_963_200;