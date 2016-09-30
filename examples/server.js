var express = require('express')
var http    = require('http');

var SocketServer = require('hbar-ws').SocketServer;


var app = express();
var server = http.createServer(app);

server.listen(9001);


var wss = new SocketServer(server);

wss.on('connection', function(socket) {
  console.log('connection opened')

  socket.on('chat', message => {
    console.log('chat', message);
  });

  socket.onclose = () => {
    console.log('connection closed', socket.id);
  };

  wss.emit('chat', 'room chat');
});
