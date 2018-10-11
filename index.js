'use strict'

const SerialPort = require('serialport')

let cerealPort
let parser

class CerealServer {
  constructor (port, baudRate) {
    cerealPort = new SerialPort(port, baudRate)
    parser = cerealPort.pipe(new SerialPort.parsers.Readline())
  }
  start () {
    cerealPort.on('open', () => console.log('Open serial connection'))
    cerealPort.on('close', () => console.log('Closed serial connection'))
    cerealPort.on('error', (error) => console.log('Error on serial connection', error))
    parser.on('data', (data) => console.log(data))
  }
  broadcast () {
  }
}

module.exports = { CerealServer: CerealServer }
