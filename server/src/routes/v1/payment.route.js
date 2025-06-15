import { Router } from 'express';
import { getVnpayResult } from '../../controllers/payment.controller.js';
import getMomoResult from '../../services/momo.service.js';
// import getZaloPayResult from '../../services/zalopay.service.js';
const router = Router();

router.route('/vnpay/callback').get(getVnpayResult);
router.route('/momo/callback').post(getMomoResult);
// router.route('/zalopay/callback').post(getZaloPayResult);

export default router;
