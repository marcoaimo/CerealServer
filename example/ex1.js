'use strict'

const { CerealServer } = require('../')

let portCheck = /(com)([1-4])| *(usbmodem)(141[1-3])/gi
let cereal = new CerealServer({ports: portCheck }, (data) => console.log(data))
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