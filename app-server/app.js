'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import rTracer from 'cls-rtracer';
import { Server } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import * as promClient from 'prom-client';

const { Registry } = promClient;

const app = express();

// --------------- Prometheus Code Start -----------------------

promClient.collectDefaultMetrics(new Registry());
const metric = {
  http: {
    requests: {
      clients: new promClient.Gauge({
        name: 'http_requests_processing',
        help: 'Http requests in progress',
        labelNames: ['method', 'path', 'status'],
      }),
      throughput: new promClient.Counter({
        name: 'http_requests_total',
        help: 'Http request throughput',
        labelNames: ['method', 'path', 'status'],
      }),
      duration: new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Request duration histogram in seconds',
        labelNames: ['method', 'path', 'status'],
      }),
    },
  },
};

// ----------- Prometheus Code END -----------------------------

import { initializeSocketIO } from './socket/index.js';
import { errorHandler } from './middlewares/error.js';
import { corsOrigin } from './config/constants.js';
import logger from './lib/logger.js';
import('./lib/mongo.js');
import AppRouter from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  serveClient: false,
  connectTimeout: 60000,
  allowEIO3: false,
  transports: ['polling', 'websocket'],
  allowUpgrades: true,
  addTrailingSlash: false,

  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.set('trust proxy', 1); // trust first proxy
// using set method to mount the `io` instance on the app to avoid usage of `global`
app.set('io', io);

// global middlewares
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(helmet());

const file = fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  rTracer.expressMiddleware({
    echoHeader: true,
    useHeader: true,
    headerName: 'x-tracer-id',
  })
);

app.use((req, res, next) => {
  if (req.path !== '/metrics') {
    logger.info(
      `starting point: ${req.protocol}: ${req.method}: ${req.hostname}: ${req.path}: `,
      req.headers,
      req.body
    );

    const end = metric.http.requests.duration.startTimer();
    metric.http.requests.clients.inc(1, Date.now());
    const startTime = Date.now();

    res.on('finish', function () {
      const executionTime = Date.now() - startTime;

      const labels = {
        method: req.method,
        path: req.route ? req.baseUrl + req.route.path : req.path,
        status: res.statusCode,
      };

      metric.http.requests.clients.dec(1, Date.now());
      metric.http.requests.throughput.inc(labels, 1, Date.now());
      end(labels);

      logger.info(
        `method: ${req.method}`,
        `url: ${req.path}`,
        `status_code: ${res.statusCode}`,
        `execution time (sec): ${executionTime / 1000}`
      );
    });
  }

  next();
});

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 429,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Static
app.use(express.static('public'));

// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);

  // console.log(169, promClient);
  const metrics = await promClient.register.metrics();
  return res.send(metrics);
});

// Routes
AppRouter(app);

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
if (process.env.NODE_ENV === 'development') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      // keep all the sections collapsed by default
      swaggerOptions: { docExpansion: 'none' },
      customSiteTitle: 'TheHTTP docs',
    })
  );
}

initializeSocketIO(io);

const PORT = Number(process.env.PORT) || 8080;
const server = httpServer.listen(
  PORT,
  logger.info(
    `🚀 Server started on Port ${PORT} in ${process.env.NODE_ENV} mode`
  )
);

// common error handling middleware
app.use(errorHandler);

// Handle Unhandled Rejection
process.on('unhandledRejection', (err, promise) => {
  logger.info(`Error: ${err.message}`);
  // Close Server and Exit
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated!');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated!');
  });
});

export default app;
