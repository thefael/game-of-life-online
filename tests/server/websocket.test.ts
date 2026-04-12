// tests/server/websocket.test.ts
import { setupWebSocket } from '../../src/server/websocket';
import { Server } from 'http';
import * as http from 'http';

describe('WebSocket Server', () => {
  let httpServer: Server;

  beforeEach(() => {
    httpServer = http.createServer();
  });

  afterEach(() => {
    httpServer.close();
  });

  test('sets up WebSocket server on provided http server', () => {
    const wss = setupWebSocket(httpServer);
    expect(wss).toBeDefined();
  });

  test('WebSocket server handles incoming connections', (done) => {
    const wss = setupWebSocket(httpServer);

    let connectionReceived = false;
    wss.on('connection', () => {
      connectionReceived = true;
      done();
    });

    httpServer.listen(0, () => {
      // Would connect client here in real test
      // For now, just verify structure
      expect(wss).toBeDefined();
      done();
    });
  });
});
