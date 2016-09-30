const SockJS  = require('sockjs-client');

module.exports = class SocketClient extends EventEmitter {
  constructor(address) {
    super();
    this.dispatchEvent = this.emit;

    this.client = new SockJS(address);

    this.client.onopen = function() {
      console.log("client connected!");
    }
  }
}
