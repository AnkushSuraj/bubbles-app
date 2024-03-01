import express from 'express';
import authRoute from './api_v_1/auth.js';

const router = express.Router();

router.use(authRoute);

export default router;