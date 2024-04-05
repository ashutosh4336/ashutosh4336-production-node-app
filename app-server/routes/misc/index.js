import { Router } from 'express';
import { slowRoute, fastRoute } from '../../controllers/misc/index.js';

const router = Router();

router.get('/slow', slowRoute);
router.get('/fast', fastRoute);

export default router;
