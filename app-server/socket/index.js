import { Server } from 'socket.io';
import { socketEvent } from '../config/constants.js';
import logger from '../lib/logger.js';
import { downloadLinks, pickRandomNumber } from '../utils/utils.js';

const prepareDownload = async (socket) => {
  try {
    // No Need to emit this event as socketio provides acknowledgement by default
    // socket.emit(socketEvent.DOWNLOAD_REQUEST_ACK, { ok: 1 });

    setTimeout(() => {
      logger.info(`File Preparation for download completed.`);
      socket.emit(socketEvent.DOWNLOAD_READY, {
        message: 'Download is ready',
        data: {
          downloadLink: downloadLinks[pickRandomNumber(0, 10)],
        },
      });
    }, 5000);
  } catch (err) {
    logger.error(`Something went wrong`);

    socket.emit(socketEvent.DOWNLOAD_ERROR, {
      error: err?.message || 'something went wrong while preparing the file',
      ok: 0,
    });
  }
};

/**
 *
 * @param {Server<import("socket.io/dist/typed-events.js").DefaultEventsMap, import("socket.io/dist/typed-events.js").DefaultEventsMap, import("socket.io/dist/typed-events.js").DefaultEventsMap, any>} io
 */
const initializeSocketIO = (io) => {
  return io.on('connection', async (socket) => {
    try {
      logger.info('🗼 User connected.', socket.id);

      // emit the connected event so that client is aware
      socket.emit(socketEvent.CONNECTED_EVENT);

      socket.on(socketEvent.DOWNLOAD, (payload, cb) => {
        logger.info(`File Preparation for download will start.`, payload);
        prepareDownload(socket);
        cb({ ok: 1 });
      });

      socket.on(socketEvent.DISCONNECT_EVENT, () => {
        logger.info('🚫 User has disconnected.');
      });
    } catch (error) {
      socket.emit(
        socketEvent.SOCKET_ERROR_EVENT,
        error?.message || 'Something went wrong while connecting to the socket.'
      );
    }
  });
};

/**
 *
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {string} roomId - Room where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
// const emitSocketEvent = (req, roomId, event, payload) => {
//   // :TODO: Change as per requirement
//   req.app.get('io').in(roomId).emit(event, payload);
// };

export { initializeSocketIO };
