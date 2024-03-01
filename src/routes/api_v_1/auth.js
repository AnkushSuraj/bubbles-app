import express from 'express';
import authController from '../../controllers/api_v_1/Auth.js';
import { email_required_schema, verify_email_otp, sign_up_user_schema, verify_otp, login_schema, resend_otp, forgot_password, reset_password, social_signup_schema, social_verification_schema } from '../../validators/Auth.js';

const router = express.Router();

router.post('/email-exists', email_required_schema, authController.email_exists);
// router.post('/phone-exists', phone_required_schema, authController.phone_exists);

router.post('/sign-up', sign_up_user_schema, authController.signUp);

// Check Google ID Exists
router.post('/social-verification', social_verification_schema, authController.social_verification);

router.put('/confirm-user', verify_email_otp, authController.confirmUser);

router.post('/login', login_schema, authController.login);

router.post('/otp-login', email_required_schema, authController.login_with_otp);


router.post('/forgot-password', email_required_schema, authController.forgotPassword);
router.put('/verify-email', verify_email_otp, authController.verifyEmailOTP);
router.post('/reset-password', reset_password, authController.resetPassword);


router.post('/resend-otp', resend_otp, authController.resendOTP);





export default router;