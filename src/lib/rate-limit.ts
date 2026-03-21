import rateLimit from 'next-rate-limit';

// Per-user rate limiting
export const divineRateLimiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,  // 100 concurrent users
});

// Per-IP rate limiting
export const apiRateLimiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});
