const { Server } = require('socket.io');
const { tokenFromCookie, verify } = require('../utils/adminSession');
const { corsOptions } = require('./cors');

function initSocket(server) {
  const io = new Server(server, {
    cors: corsOptions
  });

  io.on('connection', (socket) => {
    if (verify(tokenFromCookie(socket.handshake.headers.cookie))) socket.join('dashboard');
  });

  return io;
}

module.exports = { initSocket };
