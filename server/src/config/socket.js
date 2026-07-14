const { Server } = require('socket.io');
const { verify } = require('../utils/adminSession');
const { corsOptions } = require('./cors');

function initSocket(server) {
  const io = new Server(server, {
    cors: corsOptions
  });

  io.on('connection', (socket) => {
    const authorization = socket.handshake.auth?.token || socket.handshake.headers.authorization || '';
    const token = String(authorization).replace(/^Bearer\s+/i, '');
    if (verify(token)) socket.join('dashboard');
  });

  return io;
}

module.exports = { initSocket };
