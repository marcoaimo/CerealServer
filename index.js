'use strict'

const SerialPort = require('serialport')

class CerealServer {
  constructor (port, baudRate, callback) {
    this.client = new SerialPort(port, baudRate)
    this.parser = this.client.pipe(new SerialPort.parsers.Readline())
    this.callback = callback
  }
  start () {
    this.client.on('open', () => console.log('Open serial connection', this.client.path))
    this.client.on('close', () => {
      console.log('Closed serial connection', this.client.path)
      this.client = null
    })
    this.client.on('error', (error) => console.log('Error on serial connection', error))
    this.parser.on('data', this.callback)
  }
  broadcast () {
  }
}

module.exports = { CerealServer: CerealServer }
