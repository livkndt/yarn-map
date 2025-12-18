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
  info: (message: string, data?: any) => {
    console.info(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      sanitizeData(data),
    );
  },
  warn: (message: string, data?: any) => {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      sanitizeData(data),
    );
  },
  error: (message: string, error?: any) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      sanitizeError(error),
    );
  },
};

function sanitizeData(data: any): any {
  if (!data) return data;
  const sanitized = { ...data };

  // Mask PII
  if (sanitized.email) sanitized.email = maskEmail(sanitized.email);
  if (sanitized.reporterEmail)
    sanitized.reporterEmail = maskEmail(sanitized.reporterEmail);
  if (sanitized.phone) sanitized.phone = maskPhone(sanitized.phone);

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  delete sanitized.apiKey;

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
