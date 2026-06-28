import { registerAs } from '@nestjs/config';

export const socketConfig = registerAs('socket', () => ({
  port: parseInt(process.env.SOCKET_PORT || '3001', 10),
  path: process.env.SOCKET_PATH || '/socket.io/',
  corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*',
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL || '25000', 10),
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '50000', 10),
}));
