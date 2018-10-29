'use strict'

const SerialPort = require('serialport')

const _connectSerialPort = (server, ports) => {
  try {
    if (ports.length <= 0) throw new Error('No serial ports detected!')
    let port = ports[0].comName
    server.client = new SerialPort(port, server.baudRate)
    server.parser = server.client.pipe(new SerialPort.parsers.Readline())

    server.client.on('open', () => console.log('Open serial connection', server.client.path))
    server.client.on('close', () => {
      console.log('Closed serial connection', server.client.path)
      server.client = null
    })
    server.client.on('error', (error) => console.log('Error on serial connection', error))
    server.parser.on('data', server.callback)
  } catch (err) {
    return console.error(err)
  }
}

class CerealServer {
  constructor (port, baudRate, callback) {
    this.client = null
    this.baudRate = baudRate
    this.callback = callback
  }
  start () {
    let _serialPortsCheck = () => SerialPort.list().then((ports) => _connectSerialPort(this, ports))
    console.info('start cereal server for serial ports communication')
    _serialPortsCheck()
    setInterval(_serialPortsCheck, 5000)
  }
  stop () {
    try {
      this.client.close()
    } catch (err) {
      return console.error(err)
    }
  }
  broadcast (msg) {
    try {
      this.client.write(msg)
    } catch (err) {
      return console.error(err)
    }
  }
}

module.exports = { CerealServer: CerealServer }
