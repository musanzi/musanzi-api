import { createHash } from 'crypto';
import { Request } from 'express';

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

export function createArticleViewFingerprint(request: Request): string {
  const forwardedFor = headerValue(request.headers['x-forwarded-for']).split(',')[0]?.trim();
  const ip = forwardedFor || request.ip || request.socket.remoteAddress || 'unknown-ip';
  const userAgent = headerValue(request.headers['user-agent']) || 'unknown-user-agent';

  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}
