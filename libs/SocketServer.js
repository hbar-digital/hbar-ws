const sockjs  = require('sockjs');
const EventEmitter = require('events');

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

class Socket extends EventEmitter {
  constructor(socket) {
    super();
    this.dispatchEvent = this.emit;

    this._socket = socket;
    this.id = socket.id;

    this._socket.on('data', this._onMessage.bind(this));
    this._socket.on('close', this._onClose.bind(this));

    this.rooms = [ this.id ];
  }

  join(room) {
    this.rooms.push(room);
  }

  leave(room) {
    this.rooms = this.rooms.filter(r => r != room);
  }

  emit(topic, data) {
    this._socket.write(JSON.stringify({ topic : topic, data : data }));
  }

  _onMessage(rawData) {
    let data = JSON.parse(rawData);

    this.dispatchEvent(data.topic, data.message);
  }

  _onClose() {
    if(this.onclose) this.onclose();
  }
}

class Filter {
  constructor(wss, room) {
    this._wss = wss;
    this.rooms = [];
    this.in(room);
  }

  in(room) {
    if(typeof room === 'string') this.rooms.push(room);
    else if(Array.isArray(room)) this.rooms = this.rooms.concat(room);

    return this;
  }

  to(room) { return this.in(room); }

  emit(topic, data) {
    this._wss.sockets.filter(
      socket => socket.rooms.reduce((val, room) => val || this.rooms.indexOf(room) >= 0
      , false)
    ).forEach(socket => socket.emit(topic, data));
  }
}
