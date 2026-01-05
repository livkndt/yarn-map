/**
 * Secure logging utility to prevent leaking PII and sensitive data.
 */

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  return phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2');
}

export const logger = {
  log: (
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any,
  ) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data ? sanitizeData(data) : {}),
    };

    const output = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'debug':
        console.debug(output);
        break;
    }
  },
  info: (message: string, data?: any) => logger.log('info', message, data),
  warn: (message: string, data?: any) => logger.log('warn', message, data),
  error: (message: string, error?: any) => {
    const errorData = error instanceof Error ? sanitizeError(error) : error;
    logger.log('error', message, errorData);
  },
  debug: (message: string, data?: any) => logger.log('debug', message, data),
};

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Mask PII
    if (key.toLowerCase().includes('email')) {
      sanitized[key] = typeof value === 'string' ? maskEmail(value) : value;
    } else if (key.toLowerCase().includes('phone')) {
      sanitized[key] = typeof value === 'string' ? maskPhone(value) : value;
    }
    // Remove sensitive fields
    else if (
      ['password', 'token', 'secret', 'apikey'].includes(key.toLowerCase())
    ) {
      continue;
    }
    // Recursive sanitize for nested objects
    else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeError(error: any): any {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
  return error;
}
