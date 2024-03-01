import { RESPONSE_CODES } from '../config/constants.js';
import { verifyToken } from './jwt.js';
import { initLogger, logError, logInfo } from './logger.js';

export const authMiddleWare = async(req, res, next) => {
    try {
        await initLogger();
        const ignorePaths = ['/api/email-exists', '/api/phone-exists', '/api/sign-up', '/api/social-verification', '/api/confirm-user', '/api/verify-email', '/api/login', '/api/otp-login', '/api/resend-otp', '/api/forgot-password', '/api/reset-password'];
        const { method, headers, originalUrl } = req;

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const logObj = {
            ip,
            headers: req.headers,
            method: req.method,
            url: req.originalUrl,
            timestamp: Date.now(),
        };

        const ignoreIndex = ignorePaths.findIndex(item => item === originalUrl.split('?')[0]);

        if (ignoreIndex > -1) {
            return next();
        }

        if (!headers.authorization) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error: 'Missing auth token' });
        }

        if (req.session.token) {
            console.log(req.session.token);
            if (headers.authorization != 'Bearer ' + req.session.token) {
                return res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error: 'Wrong auth token' });
            }
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error: 'Please login first' });
        }

        logObj.user = await verifyToken(req);

        logInfo('Activity Log: ', logObj);

        return next();
    } catch (error) {
        logError('Error in authMiddleware: ', error);
        return res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error });
    }
};