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

export const getProducts = asyncHandler(async (req, res, next) => {
  logger.info(`Inside getProduct`);
  res.status(200).json({
    success: true,
    message: 'products Fetched SuccessFully',
    data: products,
  });
});

export const createProducts = asyncHandler(async (req, res, next) => {
  const { name = '', price = 3.99 } = req.body;
  logger.info(`Inside createProduct`, { name, price });

  products.push({ name, price });

  res.status(201).json({
    success: true,
    message: 'products added SuccessFully',
  });
});
