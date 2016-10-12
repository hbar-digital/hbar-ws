const SockJS  = require('sockjs-client');
const EventEmitter = require('events');

module.exports = class SocketClient extends EventEmitter {
  constructor(address, keepAliveInterval, timeoutDelay) {
    super();
    this.dispatchEvent = this.emit;
    this.emit = this._emit;
    this.keepAliveInterval = keepAliveInterval || 5000;
    this.timeoutDelay = timeoutDelay || 4000;

    this._createConnection(address);
  }

  _createConnection(address) {
    this.client = new SockJS(address);

    this.client.onopen = this._onOpen;
    this.client.onclose = this._onClose;
    this.client.onmessage = this._onMessage;
  }


  _onOpen() {
    console.log('onOpen');
    this.reconnectInterval = setInterval(this._ping, this.keepAliveInterval);
    if(this.onopen) this.onopen();
  }

  _onClose() {
    clearInterval(this.reconnectInterval);
    if(this.onclose) this.onclose();
  }

  _onMessage(message) {
    var data = JSON.parse(message.data);

    if(data.topic == 'pong') {
      console.log('pong');
      clearTimeout(this.disconnectTimeout);
    }

    this.dispatchEvent(data.topic, data.data);
  }

  _emit(topic, data) {
    this.client.send(JSON.stringify({topic : topic, data : data}));
  }

  _ping() {
    console.log('ping');
    this.emit('ping');
    this.disconnectTimeout = setTimeout(this._onClose, this.timeoutDelay);
  }
}
