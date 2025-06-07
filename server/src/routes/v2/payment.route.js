import { Router } from 'express';
import { getVnpayResult } from '../../controllers/payment.controller.js';
import getMomoResult from '../../services/momo.service.js';
import callbackmomo from '../../services/callbackmomo.service.js';
const router = Router();

router.route('/vnpay/callback').get(getVnpayResult);
router.route('/momo/callback').post(getMomoResult);
router.route('/callback').post(callbackmomo);

export default router;
