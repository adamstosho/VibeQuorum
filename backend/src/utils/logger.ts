import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';

// Check if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

// Simple, readable log format
const simpleFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create transports array
const transports: winston.transport[] = [];

// Only add file transports if NOT in serverless environment
// In serverless, file system is read-only except /tmp, and logs should go to console
if (!isServerless) {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (error) {
      // If we can't create logs directory, just use console
      console.warn('Could not create logs directory, using console only');
    }
  }

  // Only add file transports if directory exists and is writable
  try {
    if (fs.existsSync(logsDir)) {
      transports.push(
        new winston.transports.File({ 
          filename: path.join(logsDir, 'error.log'), 
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(logsDir, 'combined.log'),
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          )
        })
      );
    }
  } catch (error) {
    // If file transport fails, continue with console only
    console.warn('File logging not available, using console only');
  }
}

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: false }),
    simpleFormat
  ),
  transports,
});

// Always add console transport
if (process.env.NODE_ENV !== 'production' && !isServerless) {
  // Development: colorful console
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        simpleFormat
      ),
    })
  );
} else {
  // Production/Serverless: plain console (Vercel will capture these)
  logger.add(
    new winston.transports.Console({
      format: simpleFormat,
    })
  );
}

