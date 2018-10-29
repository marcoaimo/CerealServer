'use strict'

const SerialPort = require('serialport')
const LOCKED_SERIAL_PORTS = []
const _defaults = {
  port: null,
  baudRate: 9600
}

const _findPortByName = (comName) => {
  if (LOCKED_SERIAL_PORTS <= 0) return null
  let port = LOCKED_SERIAL_PORTS.find((p) => {
    return p.comName = comName
  })
  return port
}

const _connectSerialPort = (server, ports) => {
  try {
    if (ports.length <= 0) throw new Error('No serial ports detected!')
    let port = new CerealPort(ports[0])
    if (port.locked) return
    server.client = new SerialPort(port.comName, server.baudRate)
    server.parser = server.client.pipe(new SerialPort.parsers.Readline())
    port.lock()

    server.client.on('open', () => console.log('Open serial connection', server.client.path))
    server.client.on('close', () => {
      console.log('Closed serial connection', server.client.path)
      server.client = null
      port.unlock()
    })
    server.client.on('error', (error) => console.log('Error on serial connection', error))
    server.parser.on('data', server.callback)
  } catch (err) {
    return console.error(err)
  }
}

class CerealPort {
  constructor (port) {
    let p = _findPortByName(port.comName)
    if (p) return p
    Object.assign(this, port)
    this.locked = false
  }
  lock () {
    if (this.locked) return
    this.locked = true
    LOCKED_SERIAL_PORTS.push(this)
  }
  unlock () {
    if (!this.locked) return
    let lockedPortIndex = LOCKED_SERIAL_PORTS.indexOf(this)
    LOCKED_SERIAL_PORTS.splice(this, 1)
    this.locked = false
  }
}

class CerealServer {
  constructor (options, callback) {
    Object.assign(this, _defaults, options)
    this.client = null
    this.callback = callback
  }
  start () {
    let _serialPortsCheck = () => SerialPort.list().then((ports) => _connectSerialPort(this, ports))
    console.info('start cereal server for serial ports communication')
    _serialPortsCheck()
    setInterval(_serialPortsCheck, 15000)
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
