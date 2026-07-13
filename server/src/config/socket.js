const { Server } = require('socket.io');
const { tokenFromCookie, verify } = require('../utils/adminSession');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    if (verify(tokenFromCookie(socket.handshake.headers.cookie))) socket.join('dashboard');
  });

  return io;
}

module.exports = { initSocket };
