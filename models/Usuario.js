var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = new Schema({
   username: String,
   password: String,
   email: String
});

var Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;