'use strict'

const { CerealServer } = require('../')

const cereal = new CerealServer('/dev/tty.usbmodem1411', 9600, (data) => console.log(data))
cereal.start()
setTimeout(function () {
  console.log('Write on serial')
  cereal.broadcast('Hello world!')
}, 5000)
