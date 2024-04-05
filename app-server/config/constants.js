import dotenv from 'dotenv';
dotenv.config();

export const corsOrigin = ['development', 'local'].includes(
  process.env.NODE_ENV
)
  ? ['http://localhost:3000', 'http://localhost:5173/']
  : ['https://thehttp.in/', 'http://localhost:5173', 'http://localhost:5173/'];

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const socketEvent = Object.freeze({
  CONNECTED_EVENT: 'connected',

  DISCONNECT_EVENT: 'disconnect',

  SOCKET_ERROR_EVENT: 'socketError',

  MESSAGE_FROM_SERVER: 'messageFromServer',
});

export const AvailableChatEvents = Object.values(socketEvent);
