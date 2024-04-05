import logger from '../../lib/logger.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const products = [
  {
    name: 'Jeans',
    price: 19.99,
  },
  {
    name: 'T-Shirt',
    price: 9.99,
  },
];

export const slowRoute = asyncHandler(async (req, res, next) => {
  const promiseResolve = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`Slow Route ${Date.now()}`);
    }, 3000);
  });

  res.status(200).json({
    success: true,
    message: promiseResolve,
  });
});

export const fastRoute = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Fast Response.  ${Date.now()}`,
  });
});
