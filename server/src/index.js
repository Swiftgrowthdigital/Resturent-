require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./config/db');
const { initSocket } = require('./config/socket');

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDatabase();
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
