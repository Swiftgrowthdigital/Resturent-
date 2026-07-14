const { Server } = require('socket.io');
const { tokenFromCookie, verify } = require('../utils/adminSession');

const allowedOrigins = [process.env.CLIENT_URL];
if (process.env.NODE_ENV !== 'production' && process.env.DEV_CLIENT_URL) {
  allowedOrigins.push(process.env.DEV_CLIENT_URL);
}

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS'));
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    if (verify(tokenFromCookie(socket.handshake.headers.cookie))) socket.join('dashboard');
  });

  return io;
}

module.exports = { initSocket };
