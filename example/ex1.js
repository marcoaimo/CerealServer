'use strict'

const { CerealServer } = require('../')

let cereal = new CerealServer({port: '/dev/tty.usbmodem1411' }, (data) => console.log(data))
cereal.start()
setTimeout(function () {
  console.log('Write on serial')
  cereal.broadcast('Hello world!')
}, 5000)
setTimeout(function () {
  console.log('Close connection')
  cereal.stop()
}, 10000)
