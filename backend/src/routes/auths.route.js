import express from 'express';
import { sellerRegister, verifySellerOtp } from '../controllers/auths.controller.js';

import { tokenChecker } from '../middlewares/auths.middlewares.js';

const router = express.Router();

router.post('/sellerRegister', sellerRegister)

router.post('/verifySellerOtp', tokenChecker,verifySellerOtp)

export default router;