/**
 * Server.js
 * @author : Oscar Salomon
 * @Created on: 20 May, 2016
 */

/* Librerias necesarias para la aplicación */
var bodyParser  = require('body-parser');
var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var mongoose    = require('mongoose');

//Controladores
var mensajesController = require('./controllers/MensajesController');
var usuariosController = require('./controllers/UsuariosController');

var onlineUsers = [];

// Para acceder a los parametros de las peticiones POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost/chatSS', function(error){
   if(error){
      throw error; 
   }else{
      console.log('Conectado a MongoDB');
   }
}); 
  

/** *** *** ***
 *  Configuramos el sistema de ruteo para las peticiones web:
 */
  
  app.get('/signup', function (req, res) {
    res.sendFile( __dirname + '/views/signup.html');
  });
  
  app.post('/signup', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email    = req.body.email;    

    usuariosController.store(username,password,email, function (err, user) {
        if (err){
          res.send({ 'error': true, 'err': error});
        }else{
          res.send({ 'error': false, 'user': user });
        }       
    });    
  });

  app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    usuariosController.buscar(username,password, function(error, user){        
         if(error){
            res.send({'error': true, 'err': 'Usuario o contraseña incorrectos'});
         }else{
            if (user) {
                user.password = null;
                res.send({ 'error': false, 'user': user});
            }
         }
      });

  });
  
  /** css and js request */
  app.get('/css/foundation.min.css', function (req, res) {
    res.sendFile(__dirname + '/public/css/foundation.min.css');
  });
  
  app.get('/js/foundation.min.js', function (req, res) {
    res.sendFile(__dirname + '/public/js/foundation.min.js');
  });

  app.get('/js/chat.js', function (req, res) {
    res.sendFile(__dirname + '/public/js/chat.js');
  });
  /** *** *** */
  
  app.get('*', function(req, res) {
    res.sendFile( __dirname + '/views/chat.html');
  });


  /** *** *** ***
   *  Configuramos Socket.IO para estar a la escucha de
   *  nuevas conexiones. 
   */
  io.on('connection', function(socket) {
    
    console.log('New user connected');
    
    /**
     * Cada nuevo cliente solicita con este evento la lista
     * de usuarios conectados en el momento.
     */
    socket.on('all online users', function () {
      socket.emit('all online users', onlineUsers);
    });
    
    /**
     * Cada nuevo socket debera estar a la escucha
     * del evento 'chat message', el cual se activa
     * cada vez que un usuario envia un mensaje.
     * 
     * @param  msg : Los datos enviados desde el cliente a 
     *               través del socket.
     */
    socket.on('chat message', function(msg) {
      mensajesController.store(msg, function (err, nmsg) {
        if (err){
          res.send('Error.');
        }else{
          io.emit('chat message', nmsg);
        }       
    });    
    });

    //Devuelve los ultimos mensajes
    socket.on('latest messages', function () {
        mensajesController.list(function (err, mensajes) {
        if (err){
          res.send('Error getting messages');
        }else{
          io.emit('latest messages', mensajes);
        }       
      });
    });
    
    /**
     * Mostramos en consola cada vez que un usuario
     * se desconecte del sistema.
     */
    socket.on('disconnect', function() {
      onlineUsers.splice(onlineUsers.indexOf(socket.user), 1);
      io.emit('remove user', socket.user);
      console.log('User disconnected');
    });
    
    /**
     * Cuando un cliente se conecta, emite este evento
     * para informar al resto de usuarios que se ha conectado.
     * @param  {[type]} nuser El nuevo usuarios
     */
    socket.on('new user', function (nuser) {
      socket.user = nuser;
      onlineUsers.push(nuser);
      io.emit('new user', nuser);
    });
    
  });


  /**
   * Iniciamos la aplicación en el puerto 3000
   */
  http.listen(3000, function() {
    console.log('listening on *:3000');
  });