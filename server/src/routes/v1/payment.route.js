import { Router } from 'express';
import { getVnpayResult, getMomoResult } from '../../controllers/payment.controller.js';

const router = Router();

router.route('/vnpay/callback').get(getVnpayResult);
router.route('/momo/callback').get(getMomoResult);

export default router;
