// lib/api/errors.ts

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.details = options.details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autentifikatsiya talab qilinadi') {
    super({
      code: ErrorCode.AUTHENTICATION_ERROR,
      message,
      statusCode: 401,
    });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Ruxsat yo\'q') {
    super({
      code: ErrorCode.AUTHORIZATION_ERROR,
      message,
      statusCode: 403,
    });
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validatsiya xatosi',
    details?: Record<string, unknown>
  ) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      statusCode: 400,
      details,
    });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Topilmadi') {
    super({
      code: ErrorCode.NOT_FOUND_ERROR,
      message,
      statusCode: 404,
    });
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Server xatosi') {
    super({
      code: ErrorCode.SERVER_ERROR,
      message,
      statusCode: 500,
    });
    this.name = 'ServerError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Tarmoq xatosi') {
    super({
      code: ErrorCode.NETWORK_ERROR,
      message,
      statusCode: 0,
    });
    this.name = 'NetworkError';
  }
}
