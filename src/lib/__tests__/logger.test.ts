import { logger } from '../logger';

describe('Logger', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test info message', { key: 'value' });
    expect(consoleInfoSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.message).toBe('Test info message');
    expect(logOutput.level).toBe('info');
    expect(logOutput.key).toBe('value');
    expect(logOutput.timestamp).toBeDefined();
  });

  it('should log warn messages', () => {
    logger.warn('Test warn message');
    expect(consoleWarnSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(logOutput.level).toBe('warn');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(logOutput.level).toBe('error');
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(consoleDebugSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
    expect(logOutput.level).toBe('debug');
  });

  it('should automatically mask emails', () => {
    logger.info('User login', { email: 'test@example.com' });
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.email).toMatch(/t\*\*\*.*@example\.com/);
  });

  it('should automatically mask phone numbers', () => {
    logger.info('User contact', { phone: '0123456789' });
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.phone).toMatch(/\d{3}\*\*\*\*\d{3}/);
  });

  it('should automatically remove passwords', () => {
    logger.info('Login attempt', {
      password: 'secretpassword123',
      username: 'user',
    });
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.password).toBeUndefined();
    expect(logOutput.username).toBe('user');
  });

  it('should automatically remove tokens', () => {
    logger.info('API call', { token: 'sensitive-token', data: 'some-data' });
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.token).toBeUndefined();
    expect(logOutput.data).toBe('some-data');
  });

  it('should handle nested objects for sanitization', () => {
    const data = {
      user: {
        email: 'nested@example.com',
        profile: {
          phone: '9876543210',
        },
      },
    };
    logger.info('Nested data', data);
    const logOutput = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logOutput.user.email).toMatch(/n\*\*\*.*@example\.com/);
    expect(logOutput.user.profile.phone).toMatch(/\d{3}\*\*\*\*\d{3}/);
  });
});
