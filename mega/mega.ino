#include <SPI.h>
#include <Ethernet.h>
#include <OneWire.h>
#include <DallasTemperature.h>

byte mac[] = {0x9C, 0xDC, 0x71, 0xC0, 0x27, 0x50};
IPAddress ip(192, 168, 1, 22);
IPAddress hServer(192, 168, 1, 20); // hsrv
EthernetClient client;
int HTTP_PORT = 3000;

OneWire oneWire(26); // вход датчиков 18b20
DallasTemperature dt(&oneWire);

DeviceAddress aBox   = {0x28, 0x6B, 0x89, 0x97, 0x04, 0x00, 0x00, 0xE4};
DeviceAddress aRoom1 = {0x28, 0x43, 0x8F, 0x82, 0x05, 0x00, 0x00, 0x7D};
DeviceAddress aOut   = {0x28, 0x5A, 0x5F, 0xBD, 0x05, 0x00, 0x00, 0x3C};

String freeRam() { // возвращает свободную RAM в ардуино в байтах
  extern int __heap_start, *__brkval;
  int v;
  return String( (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval) );
}

void setup() {
  Serial.begin(9600);
  Ethernet.begin(mac, ip);
  Serial.println("Start!");
  dt.begin();
  delay(2000);
}

void loop() {
  if (client.connect(hServer, HTTP_PORT)) {
    Serial.println("Connected to server");

    dt.requestTemperatures();                  // считываем температуру с датчиков
    delay(1000);
    String data = String("tBox=") + dt.getTempC(aBox) + "&tRoom1=" + dt.getTempC(aRoom1) + "&tOutside=" + dt.getTempC(aOut) + "&freeRAM=" + freeRam();
    Serial.println("send: " + data);

    client.println("GET /senddata?" + data + " HTTP/1.1");
    client.println("Host: 192.168.1.20");
    client.println("Connection: close");
    client.println();

    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        Serial.print(c);
      }
    }

    client.stop();
    Serial.println("disconnected");
    Serial.println();
  }
  else {
    Serial.println("connection failed");
  }
 delay(9000);
}