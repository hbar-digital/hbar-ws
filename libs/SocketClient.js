const SockJS  = require('sockjs-client');
const EventEmitter = require('events');

module.exports = class SocketClient extends EventEmitter {
  constructor(address) {
    super();
    this.dispatchEvent = this.emit;
    this.emit = this._emit;

    this.client = new SockJS(address);

    this.client.onopen = () => { if(this.onopen) this.onopen(); }

    this.client.onmessage = (message) => {
      var data = JSON.parse(message.data);

      this.dispatchEvent(data.topic, data.data);
    }

    this.client.onclose = () => { if(this.onclose) this.onclose(); }
  }

  _emit(topic, data) {
    this.client.send(JSON.stringify({topic : topic, data : data}));
  }
}
