'use strict';
import products from './routes/products/index.js';
import misc from './routes/misc/index.js';

export default function AppRouter(app) {
  app.use('/api/v1/products', products);
  app.use('/api/v1/misc', misc);
}
