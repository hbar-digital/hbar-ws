module.exports = class Filter {
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
