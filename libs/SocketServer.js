const sockjs  = require('sockjs');
const EventEmitter = require('events');

const Filter = require('./Filter');
const Socket = require('./Socket');

module.exports = class SocketServer extends EventEmitter {
  constructor(http, prefix) {
    super();
    this.dispatchEvent = this.emit;
    this.emit = this._emit;

    this.sockets = [];

    this._wss = sockjs.createServer({sockjs_url: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.1/sockjs.min.js'});

    this._wss.installHandlers(http, {prefix : prefix});

    this._wss.on('connection', this._onConnection.bind(this));
  }

  _onConnection(rawSocket) {
    let socket = new Socket(rawSocket);

    this.sockets.push(socket);

    this.dispatchEvent('connection', socket);
  }

  _emit(topic, data) {
    this.sockets.forEach(socket => socket.emit(topic, data));
  }

  in(room) {
    return new Filter(this, room);
  }

  to(room) { return this.in(room); }
}
