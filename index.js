'use strict'

const SerialPort = require('serialport')
const LOCKED_SERIAL_PORTS = []
const _defaults = {
  ports: null,
  baudRate: 9600,
  heartBeatTime: 500,
  openCallback: (client) => console.log('Open serial connection', client.path),
  closeCallback: (client) => console.log('Closed serial connection', client.path)
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
    if (server.ports && server.ports.length > 0) {
      ports = server.ports.map((searchStr) => ports.filter((p) => {
        let regxp = new RegExp(searchStr).exec(p.comName)
        return regxp ? regxp.includes(p.comName) : false
      })).reduce((a,b) => a.indexOf(b[0]) >= 0 ? [] : a.concat(b), [])
    }
    if (!ports || ports.length <= 0) throw new Error('No serial ports detected!')
    ports.forEach((p) => {
      let port = new CerealPort(p)
      if (port.locked) return
      let client = new SerialPort(port.comName, server.baudRate)
      let parser = client.pipe(new server.parser())
      port.lock()

      client.on('open', () => server.openCallback(client))
      client.on('close', () => {
        server.closeCallback(client)
        _closeClientConnection(server, client)
        parser = null
        port.unlock()
      })
      client.on('error', (error) => console.log('Error on serial connection', error))
      parser.on('data', server.dataHandler)

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
  constructor (options, dataHandler) {
    Object.assign(this, _defaults, options)
    this.clients = []
    this.parser = SerialPort.parsers.Readline
    this.dataHandler = dataHandler
    this.heartBeatInterval = null
    if (this.ports && !Array.isArray(this.ports)) this.ports = [this.ports]
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
