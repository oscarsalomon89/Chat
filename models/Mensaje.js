var mongoose = require('mongoose');

var MensajeSchema = mongoose.Schema({
   username: String,
   date: Date,
   message: String
});
var Mensaje = mongoose.model('Mensaje', MensajeSchema);

module.exports = Mensaje;