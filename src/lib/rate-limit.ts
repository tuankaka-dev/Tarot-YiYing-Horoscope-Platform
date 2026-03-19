import rateLimit from 'next-rate-limit';

export const divineRateLimiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});
