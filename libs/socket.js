let Cookies = require('cookies');
let config = require('config');
let mongoose = require('mongoose');
let co = require('co');
let User = require('../models/user');

let socketIO = require('socket.io');

let socketRedis = require('socket.io-redis');

let sessionStore = require('./sessionStore');

function socket(server) {
  let io = socketIO(server);

  let userList = [];
  
  function updateUsernames() {
     io.sockets.emit('get userList', userList);
    }


  io.adapter(socketRedis({host: config.redis.url, port: config.redis.port}));

  


  io.use(function(socket, next) {
    let handshakeData = socket.request;

    let cookies = new Cookies(handshakeData, {}, config.keys);

    let sid = 'koa:sess:' + cookies.get('sid');
    

    
    co(function* () {

      let session = yield* sessionStore.get(sid, true);

      if (!session) {
        throw new Error("No session");
      }

      if (!session.passport && !session.passport.user) {
        throw new Error("Anonymous session not allowed");
      }

      socket.user = yield User.findById(session.passport.user);
      socket.session = session;
      session.socketIds = session.socketIds ? session.socketIds.concat(socket.id) : [socket.id];

      yield sessionStore.save(sid, session);

      socket.on('disconnect', function() {
        co(function* clearSocketId() {
          let session = yield* sessionStore.get(sid, true);
          if (session) {
            session.socketIds.splice(session.socketIds.indexOf(socket.id), 1);
            yield* sessionStore.save(sid, session);
          }
          if (socket.user.displayName) {
            userList.splice(userList.indexOf(socket.user.displayName), 1);
            updateUsernames();
          }
          socket.broadcast.emit('new message', {msg: `<em>${socket.user.displayName}</em> disconnected :(`, user: 'Admin'});
        }).catch(function(err) {
          console.error("session clear error", err);
        });
      });

    }).then(function() {
      next();
    }).catch(function(err) {
      console.error(err);
      next(new Error("Error has occured."));
    });

  });

  io.on('connection', function (socket) {
 
    if (!~userList.indexOf(socket.user.displayName)) {
     
      if (!socket.session.cookie.refreshed) {
        socket.broadcast.emit('new message', {msg: `<em>${socket.user.displayName}</em> connected!`, user: 'Admin'});
        socket.emit('new message', {msg: `Hello  <em>${socket.user.displayName}</em>!`, user: 'Admin'} );
        co(function* () {
        let handshakeData = socket.request;

        let cookies = new Cookies(handshakeData, {}, config.keys);

        let sid = 'koa:sess:' + cookies.get('sid');
        let session = yield* sessionStore.get(sid, true);
        session.cookie.refreshed = true;
        yield* sessionStore.save(sid, session);

        }).then(function() {      
        }).catch(function(err) {
          console.error(err);
        });
      }
      
      userList.push(socket.user.displayName);
      
    }

    updateUsernames();
       
    socket.on('send message', data => {
      io.emit('new message', {msg: data, user: socket.user.displayName});
      socket.broadcast.emit('stopped');
    })

    socket.on('ityping', () => {
      socket.broadcast.emit('typing', `${socket.user.displayName} typing...`); 
    })

    socket.on('stop typing', () => {
      socket.broadcast.emit('stopped');   
    });   
  });
}


let socketEmitter = require('socket.io-emitter');
let redisClient = require('redis').createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
socket.emitter = socketEmitter(redisClient);

module.exports = socket;
