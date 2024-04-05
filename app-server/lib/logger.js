await import('winston-daily-rotate-file');
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rTracer from 'cls-rtracer';
import { isPlainObject } from 'is-plain-object';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;

/**
* 1. Please replace "microServiceName" to appropriate micro Service Name.
* 2. Set the environment.
* 3. Install cls-rtracer, winston, winston-daily-rotate-file, and
is-plain-object npm package
*/

const { NODE_ENV, MICROSERVICE_NAME: serviceName } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excludedKeys =
  NODE_ENV === 'production'
    ? [
        'client_id',
        'clientid',
        'client_secret',
        'clientsecret',
        'secret',
        'password',
        'first_name',
        'last_name',
        'email',
        'email_id',
        'em',
        'user_email',
        'auth_email_id',
        'otp',
        'resetlink',
      ]
    : [];

const logFormat = printf((info) => {
  const rid = rTracer.id();
  let message = deepRegexReplace(info.message);

  message = isPlainObject(message) ? [message] : message;

  let final_message = [];

  for (let i = 0; i < message.length; i++) {
    const item =
      typeof message[i] === 'object' ? JSON.stringify(message[i]) : message[i];
    final_message.push(item);
  }

  final_message = final_message.join(' | ');

  return rid
    ? `${info.timestamp} [${info.service}] ${info.level} [request-id:${rid}]: ${final_message}`
    : `${info.timestamp} [${info.service}] ${info.level} [request-id:0000]: ${final_message}`;
});

const deepRegexReplace = (value, singleKey = '') => {
  try {
    const parsedValue = JSON.parse(value);

    if (typeof parsedValue == 'object') {
      value = parsedValue;
    }
  } catch (e) {}
  try {
    if (typeof value === 'undefined' || typeof excludedKeys === 'undefined')
      return value || '';
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i = i + 1) {
        value[i] = deepRegexReplace(value[i]);
      }
      return value;
    } else if (isPlainObject(value)) {
      for (let key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          value[key] = deepRegexReplace(value[key], key);
        }
      }

      return value;
    } else {
      if (excludedKeys.includes(singleKey.toLowerCase())) return '[REDACTED]';
      else return value;
    }
  } catch (e) {
    console.error('Logger deepRegexReplace', e);
    return value;
  }
};

const winstonLogger = createLogger({
  format: combine(
    format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })(),
    timestamp(),
    logFormat
  ),
  level: 'debug',
  transports: [
    new transports.DailyRotateFile({
      name: 'file',
      datePattern: 'YYYY-MM-DD',
      filename: path.join(__dirname, '../logs', `${serviceName}_%DATE%.log`), // Set the micro service name
      // zippedArchive: true,
      maxFiles: '7d',
      maxSize: '20m',
      timestamp: true,
    }),
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),
  ],
  defaultMeta: { service: serviceName }, // Set the micro service name
});

const wrapper = (original) => {
  return (...args) => {
    const _transformedArgs = [];

    args.forEach((arg) => {
      if (typeof arg === 'object') {
        if (arg instanceof Error) {
          _transformedArgs.push(arg.stack);
        } else {
          _transformedArgs.push(JSON.stringify(arg));
        }
      } else {
        _transformedArgs.push(arg);
      }
    });

    return original(_transformedArgs);
  };
};

winstonLogger.error = wrapper(winstonLogger.error);
winstonLogger.warn = wrapper(winstonLogger.warn);
winstonLogger.info = wrapper(winstonLogger.info);
winstonLogger.debug = wrapper(winstonLogger.debug);

const logger = {
  log: function (level, message, ...args) {
    winstonLogger.log(level, message, ...args);
  },
  error: function (message, ...args) {
    winstonLogger.error(message, ...args);
  },
  warn: function (message, ...args) {
    winstonLogger.warn(message, ...args);
  },
  info: function (message, ...args) {
    winstonLogger.info(message, ...args);
  },
  debug: function (message, ...args) {
    winstonLogger.debug(message, ...args);
  },
};

export default logger;
