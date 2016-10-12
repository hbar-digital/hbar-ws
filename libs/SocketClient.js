const SockJS  = require('sockjs-client');
const EventEmitter = require('events');

module.exports = class SocketClient extends EventEmitter {
  constructor(address, keepAliveInterval, timeoutDelay) {
    super();
    this.dispatchEvent = this.emit;
    this.emit = this._emit;

    this.keepAliveInterval = keepAliveInterval || 25000;
    this.timeoutDelay = timeoutDelay || 5000;

    this._createConnection(address);
  }

  _createConnection(address) {
    this.socket = new SockJS(address);

    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
  }


  _onOpen() {
    this.reconnectInterval = setInterval(this._ping.bind(this), this.keepAliveInterval);
    if(this.onopen) this.onopen();
  }

  _onClose(reconnect) {
    clearInterval(this.reconnectInterval);
    if(this.onclose) this.onclose();

    this._reconnect();
  }

  _onMessage(message) {
    var data = JSON.parse(message.data);

    if(data.topic == 'pong') {
      clearTimeout(this.disconnectTimeout);
    }

    this.dispatchEvent(data.topic, data.data);
  }

  _emit(topic, data) {
    this.socket.send(JSON.stringify({topic : topic, data : data}));
  }

  _reconnect() {
    console.log('reconnecting');

    //TODO:
    // add reconnect logic
    // ie. call _createConnection on an interval
  }

  _ping() {
    this.emit('ping');
    this.disconnectTimeout = setTimeout(this._onClose.bind(this), this.timeoutDelay);
  }
}
