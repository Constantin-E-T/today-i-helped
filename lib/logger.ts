import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// In Next.js, we need to avoid using worker threads (pino-pretty transport)
// because they can crash during hot module reloads in server actions
// Using basic pino without transport is more stable in Next.js environment
const logger = pino({
  level: isTest ? 'silent' : isDevelopment ? 'debug' : 'info',
  // Browser-friendly options for Next.js
  browser: {
    asObject: true,
  },
  // Better formatting without worker threads
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
      };
    },
  },
  // Timestamp formatting
  timestamp: pino.stdTimeFunctions.isoTime,
  // Production uses JSON format by default (same as development now)
});

export default logger;
