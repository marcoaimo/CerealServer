'use strict'

const { CerealServer } = require('../')

let cereal = new CerealServer({port: '/dev/tty.usbmodem1411' }, (data) => console.log(data))
cereal.start()
setInterval(function () {
  console.log('Write on serial')
  cereal.broadcast('Hello world!')
}, 5000)
setTimeout(function () {
  console.log('Close connection')
  cereal.stop()
}, 15000)
setTimeout(function () {
  console.log('Reopen connection')
  cereal.start()
}, 25000)