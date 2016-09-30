const sockjs  = require('sockjs');
const EventEmitter = require('events');

const Filter = require('./Filter');
const Socket = require('./Socket');

module.exports = class SocketServer extends EventEmitter {
  constructor(http) {
    super();
    this.dispatchEvent = this.emit;

    this.sockets = [];

    this._wss = sockjs.createServer({sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js'});

    this._wss.installHandlers(http);

    this._wss.on('connection', this.onConnection.bind(this));
  }

  onConnection(rawSocket) {
    let socket = new Socket(rawSocket);

    this.sockets.push(socket);

    this.dispatchEvent('connection', socket);
  }

  in(room) {
    return new Filter(this, room);
  }

  to(room) { return this.in(room); }
}
