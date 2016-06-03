var Usuario = require('../models/Usuario');
var bcrypt  = require('bcrypt-nodejs');

exports.store = function(name,pass,email,callback){
   //encriptacion del password
   var salt = bcrypt.genSaltSync();
   var password_hash = bcrypt.hashSync(pass,salt);
   var usuario = new Usuario({
         username: name,
         password: password_hash,
         email: email
      });
      usuario.save(function(error, user){
         if(error){
            return callback(error, null);
         }else{
            return callback(null, user);
         }
      }); 
};

exports.buscar = function(name,pass,callback){
   Usuario.findOne({ username: name}, function(error, user){        
         if(error){
            return callback(error, null);
         }else{
            if (user) {
              if (bcrypt.compareSync(pass,user.password)) {
                  return callback(null, user);
              }
              else {
                return callback(error, null);
              }
            }
         }
      });
};