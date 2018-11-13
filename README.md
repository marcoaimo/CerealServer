# CerealServer

Simple Node.js server to manage communication through serial port.

## Install

```
npm i --save cerealserver
```

## Dependencies

[Node-serialport](https://github.com/node-serialport/node-serialport)

## How it works

On your app.js file

```javascript
const { CerealServer } = require('cerealserver')

/***
CerealServer constructor accept 2 parameters
 - options
 - callback to handle data send on serial port
***/
const cereal = new CerealServer({ ports: '/dev/tty.usbmodem1411', baudRate: 9600 }, (data) => console.log(data))
cereal.start()
```

## Documentation
#### Constructor

CerealServer constructor accept 2 parameters
- options             =>  Object
  - ports               =>  null | String | RegExp | String[] | Default is: null
  - baudRate            =>  Integer                           | Default is: 9600
  - heartBeatTime       =>  Integer (millis)                  | Default is:500
  - openCallback        =>  Function(port)                    | Default is: (port) => console.log('Open serial connection', port.path)
  - closeCallback       =>  Function(port)                    | Default is: (port) => console.log('Closed serial connection', port.path)
- dataHandlerCallback =>  Function(data)                         | Default is: undefined

#### Description

When it starts CerealServer will look at any open serial port to open a communication.
If **ports** option is defined, it'll work as a filter to open communication only with port(s) name that match its value.
CerealServer will perform a polling check to look for new devices to open communication with. This check will be performed every **heartBeatTime** milliseconds.
The **baudRate** option is unique for every istance of CerealServer.
The **port** parameter passed to openCallback and closeCallback is the **SerialPort** instance as defined by [Node-serialport](https://serialport.io/docs/en/api-serialport#serialport).
The **data** parameter  passed to **dataHandlerCallback** is the stream received on serial port parsed by a newline (\n) delimiter.

#### Methods

CerealPort instance exposes some methods to simplify communication with devices through the serial port.

**start()**: Starts the server and the polling check to open communication with connected devices.
**stop()**: Stops the server and closes every communications with connected devices.
**broadcast(msg)**: Broadcast the **msg** message to every connected devices.
