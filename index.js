'use strict'

const SerialPort = require('serialport')
const LOCKED_SERIAL_PORTS = []
const _defaults = {
  port: null,
  baudRate: 9600,
  heartBeatTime: 500
}

const _findPortByName = (comName) => {
  if (LOCKED_SERIAL_PORTS <= 0) return null
  let port = LOCKED_SERIAL_PORTS.find((p) => {
    return p.comName = comName
  })
  return port
}

const _closeClientConnection = (server, client) => {
  let clientIndex = server.clients.indexOf(client)
  if (clientIndex >= 0) server.clients.splice(clientIndex, 1)
  client = null
}

const _connectSerialPort = (server, ports) => {
  try {
    if (!ports || ports.length <= 0) throw new Error('No serial ports detected!')
    ports.forEach((p) => {
      let port = new CerealPort(p)
      if (port.locked) return
      let client = new SerialPort(port.comName, server.baudRate)
      let parser = client.pipe(new server.parser())
      port.lock()

      client.on('open', () => console.log('Open serial connection', client.path))
      client.on('close', () => {
        console.log('Closed serial connection', client.path)
        _closeClientConnection(server, client)
        parser = null
        port.unlock()
      })
      client.on('error', (error) => console.log('Error on serial connection', error))
      parser.on('data', server.callback)

      server.clients.push(client)
    })
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
    this.clients = []
    this.parser = SerialPort.parsers.Readline
    this.callback = callback
    this.heartBeatInterval = null
  }
  start () {
    let _serialPortsCheck = () => SerialPort.list().then((ports) => _connectSerialPort(this, ports))
    console.info('start cereal server for serial ports communication')
    _serialPortsCheck()
    this.heartBeatInterval = setInterval(_serialPortsCheck, this.heartBeatTime)
  }
  stop () {
    try {
      if (this.heartBeatInterval) {
        clearInterval(this.heartBeatInterval)
        this.heartBeatInterval = null
      }
      if (!this.clients || this.clients.length <= 0) throw new Error('No client connected!')
      this.clients.forEach((cli) => cli.close())
    } catch (err) {
      return console.error(err)
    }
  }
  broadcast (msg) {
    try {
      if (!this.clients || this.clients.length <= 0) throw new Error('No client connected!')
      this.clients.forEach((cli) => cli.write(msg))
    } catch (err) {
      return console.error(err)
    }
  }
}

module.exports = { CerealServer: CerealServer }
