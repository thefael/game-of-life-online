// src/server/index.ts
import express, { Express } from 'express';
import http from 'http';
import path from 'path';
import { setupWebSocket } from './websocket';

const app: Express = express();
const httpServer = http.createServer(app);

// Middleware
app.use(express.json());

// Serve static files (React build - Phase 3)
app.use(express.static(path.join(__dirname, '../../public')));

// Setup WebSocket
const wss = setupWebSocket(httpServer);
console.log('WebSocket server setup complete');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback: serve index.html for client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Server initialization
const PORT = process.env.PORT || 3001;

const server = httpServer.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

export { httpServer, wss };
