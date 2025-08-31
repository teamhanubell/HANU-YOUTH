// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import next from 'next';
import path from 'path';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : (dev ? 3001 : 3000);
const hostname = process.env.HOST || 'localhost';

async function startDevSocketServer() {
  try {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Socket server');
    });

    const io = new Server(server, { path: '/api/socketio', cors: { origin: '*' } });

    // Optional: tune ping/timeout for faster detection (adjust as needed)
    ;(io as any).engine.pingInterval = 20000;
    ;(io as any).engine.pingTimeout = 5000;

    setupSocket(io);

    server.listen(currentPort, hostname, () => {
      console.log(`Socket server ready on https://${hostname}:${currentPort}`);
      console.log(`Socket.IO endpoint: ws://${hostname}:${currentPort}/api/socketio`);
    });

    server.on('error', (err) => {
      console.error('Dev socket server error:', err);
    });
  } catch (err) {
    console.error('Failed to start dev socket server:', err);
    process.exit(1);
  }
}

async function createCustomServer() {
  try {
    // Create Next.js app with proper configuration in production
    const nextApp = next({
      dev,
      dir: process.cwd(),
      hostname,
      port: currentPort,
      conf: { distDir: 'out' },
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO in production
    const server = createServer(async (req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }

      try {
        await handle(req, res);
      } catch (error) {
        console.error('Request handling error:', error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Tune Socket.IO ping settings
    ;(io as any).engine.pingInterval = 10000;
    ;(io as any).engine.pingTimeout = 5000;

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
      console.log(`> Environment: ${dev ? 'Development' : 'Production'}`);
    });

    // Reduce keep-alive to free sockets faster (tweak if needed)
    ;(server as any).keepAliveTimeout = 8000;
    ;(server as any).headersTimeout = 10000;

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

(async function main() {
  if (dev) {
    await startDevSocketServer();
    return;
  }

  await createCustomServer();
})();
