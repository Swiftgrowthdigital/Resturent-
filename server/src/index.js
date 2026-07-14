require('dotenv').config();
const { validateEnvironment } = require('./config/env');
validateEnvironment();
if (process.env.NODE_ENV !== 'production') {
  console.log('Restaurant Name:', process.env.RESTAURANT_NAME);
}
const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./config/db');
const { initSocket } = require('./config/socket');
const { verifySupabaseStorage } = require('./config/supabase');

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDatabase();
  if (process.env.NODE_ENV === 'production') await verifySupabaseStorage();
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error.stack || error.message || error);
  process.exit(1);
});
