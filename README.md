# CerealServer

Simple server to manage communication through serial port.

## Install

```
npm i --save cerealserver
```

## How it works

On your app.js file

```
const { CerealServer } = require('cerealserver')
/***
CerealServer constructor accept 3 parameters
 - serialport name
 - baudrate
 - callback to handle data send on serial port
***/
const cereal = new CerealServer('/dev/tty.usbmodem1411', 9600, (data) => console.log(data))
cereal.start()
```
