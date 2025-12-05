/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class AIError extends AppError {
  constructor(
    message: string,
    public code: string,
    statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message, statusCode);
  }
}

export const AI_ERRORS = {
  RATE_LIMIT: new AIError(
    'AI rate limit exceeded',
    'AI_RATE_LIMIT',
    429,
    true
  ),
  API_ERROR: new AIError(
    'AI service temporarily unavailable',
    'AI_API_ERROR',
    503,
    true
  ),
  INVALID_RESPONSE: new AIError(
    'AI returned invalid response',
    'AI_INVALID_RESPONSE',
    500,
    true
  ),
  QUOTA_EXCEEDED: new AIError(
    'AI API quota exceeded',
    'AI_QUOTA_EXCEEDED',
    503,
    false
  ),
};

