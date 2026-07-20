import createError from 'http-errors';

export function badRequest(message: string): ReturnType<typeof createError> {
  return createError(400, message);
}

export function unauthorized(message = 'Unauthorized'): ReturnType<typeof createError> {
  return createError(401, message);
}

export function forbidden(message = 'Forbidden'): ReturnType<typeof createError> {
  return createError(403, message);
}

export function notFoundError(message = 'Not found'): ReturnType<typeof createError> {
  return createError(404, message);
}

export function internalError(message = 'Internal Server Error'): ReturnType<typeof createError> {
  return createError(500, message);
}
