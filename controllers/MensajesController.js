var Mensaje     = require('../models/Mensaje');

exports.store = function(msg,callback){
   var mensaje = new Mensaje({
         username: msg.username,
         date: Date.now(),
         message: msg.message
      });
      mensaje.save(function(error, documento){
         if(error){
            return callback(error, null);
         }else{
            return callback(null, documento);
         }
      }); 
};

exports.list = function(callback){
   Mensaje.find({}, function(error, mensajes){
          if(error){
             return callback(error, null);
          }else{
             return callback(null, mensajes);
          }
       }) 
};