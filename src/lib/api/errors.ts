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

/** True when `error` represents an HTTP 403 — whether it's one of our typed
 * AppError instances (client-side query errors, which keep their prototype),
 * a raw axios/fetch response object, or a server-thrown Error whose message
 * embeds the status code (Server Components lose the error's prototype and
 * custom fields crossing the RSC boundary, so only `message` survives there —
 * our SSR fetchers throw `new Error(\`...: ${res.status}\`)`, hence the regex
 * fallback). Used to route 403s to <ForbiddenState /> instead of a generic
 * error message. */
export function isForbiddenError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof AppError) return error.statusCode === 403;
  if (typeof error === 'object') {
    const anyErr = error as { response?: { status?: number }; status?: number };
    if (anyErr.response?.status === 403) return true;
    if (anyErr.status === 403) return true;
  }
  if (error instanceof Error) return /(^|\D)403(\D|$)/.test(error.message);
  return false;
}
