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

    this._wss = sockjs.createServer({sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js'});

    this._wss.installHandlers(http, prefix);

    this._wss.on('connection', this.onConnection.bind(this));
  }

  onConnection(rawSocket) {
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
