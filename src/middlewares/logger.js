// import config from 'config';
import path from 'path';
import winston from 'winston';

const logFileName = path.join(new URL(
    import.meta.url).pathname, '../../../', 'logs/app.log');
const errorLogFileName = path.join(new URL(
    import.meta.url).pathname, '../../../', 'logs/error.log');
let logger = null;

export async function initLogger() {
    try {
        logger = await winston.createLogger({
            format: winston.format.json(),
            exceptionHandlers: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: errorLogFileName,
                    level: 'error'
                })
            ],
            transports: [
                new winston.transports.Console(),
                // new winston.transports.File({
                //     filename: logFileName
                // })
            ]
        });
    } catch (err) {
        throw err;
    }
}

export function logInfo(message, data) {
    logger.log('info', message, data);
}

export function logError(message, data) {
    logger.log('error', message, data);
}

export function logWarn(message, data) {
    logger.log('warn', message, data);
}

export function logDebug(message, data) {
    logger.log('debug', message, data);
}

export function logSilly(message, data) {
    logger.log('silly', message, data);
}