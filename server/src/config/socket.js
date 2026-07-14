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

    // The public menu shares this Socket.IO server and usually connects before an
    // administrator signs in. Let that same connection opt into the protected
    // dashboard room after login without requiring a page refresh.
    socket.on('dashboard:subscribe', (rawToken, acknowledge) => {
      const session = verify(String(rawToken || '').replace(/^Bearer\s+/i, ''));
      if (!session) {
        socket.leave('dashboard');
        acknowledge?.({ ok: false });
        return;
      }
      socket.join('dashboard');
      acknowledge?.({ ok: true });
    });

    socket.on('dashboard:unsubscribe', () => socket.leave('dashboard'));
  });

  return io;
}

module.exports = { initSocket };
