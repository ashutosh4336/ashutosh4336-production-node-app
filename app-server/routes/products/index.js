import { Router } from 'express';
import {
  getProducts,
  createProducts,
} from '../../controllers/products/index.js';

const router = Router();

router.route('/').get(getProducts).post(createProducts);

export default router;
