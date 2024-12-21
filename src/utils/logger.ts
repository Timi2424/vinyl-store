import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const { combine, timestamp, printf, errors } = winston.format;

const systemLogPath = path.join(process.cwd(), 'logs', 'system.log');
const controllerLogPath = path.join(process.cwd(), 'logs', 'controller.log');

export const systemLogger = WinstonModule.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: systemLogPath }),
    ],
});

export const controllerLogger = WinstonModule.createLogger({
    level: 'http',
    format: combine(
        timestamp(),
        printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.File({ filename: controllerLogPath }),
    ],
});
