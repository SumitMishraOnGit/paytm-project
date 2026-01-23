/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting requests per IP/user
 * Uses in-memory storage (for production, use Redis)
 */

// In-memory store for rate limiting
// Format: { key: { count: number, resetTime: timestamp } }
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiter middleware with custom settings
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests allowed in window
 * @param {string} options.message - Error message when limit exceeded
 * @param {string} options.keyGenerator - 'ip' | 'user' | 'both'
 */
function createRateLimiter(options = {}) {
    const {
        windowMs = 60 * 1000, // 1 minute default
        maxRequests = 10,
        message = 'Too many requests. Please try again later.',
        keyGenerator = 'ip', // 'ip', 'user', or 'both'
        skipSuccessfulRequests = false,
    } = options;

    return (req, res, next) => {
        // Generate the rate limit key
        let key;
        if (keyGenerator === 'user' && req.userId) {
            key = `user:${req.userId}`;
        } else if (keyGenerator === 'both' && req.userId) {
            key = `both:${req.ip}:${req.userId}`;
        } else {
            key = `ip:${req.ip}`;
        }

        // Add endpoint to key for granular limiting
        key += `:${req.method}:${req.baseUrl}${req.path}`;

        const now = Date.now();
        const record = rateLimitStore.get(key);

        if (!record) {
            // First request - create new record
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now
            });

            // Set rate limit headers
            res.set('X-RateLimit-Limit', maxRequests);
            res.set('X-RateLimit-Remaining', maxRequests - 1);
            res.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

            return next();
        }

        if (now > record.resetTime) {
            // Window expired - reset
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now
            });

            res.set('X-RateLimit-Limit', maxRequests);
            res.set('X-RateLimit-Remaining', maxRequests - 1);
            res.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

            return next();
        }

        // Within window - check limit
        if (record.count >= maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);

            res.set('X-RateLimit-Limit', maxRequests);
            res.set('X-RateLimit-Remaining', 0);
            res.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
            res.set('Retry-After', retryAfter);

            console.warn(`[RATE_LIMIT] Blocked request from ${key}`);

            return res.status(429).json({
                error: 'TOO_MANY_REQUESTS',
                message: message,
                retryAfter: retryAfter,
                retryAfterMs: record.resetTime - now
            });
        }

        // Increment count
        record.count++;
        rateLimitStore.set(key, record);

        res.set('X-RateLimit-Limit', maxRequests);
        res.set('X-RateLimit-Remaining', maxRequests - record.count);
        res.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

        next();
    };
}

// Pre-configured rate limiters for different use cases

// Strict: For auth endpoints (login attempts)
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    keyGenerator: 'ip'
});

// Moderate: For signup (prevent spam accounts)
const signupLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many accounts created. Please try again after an hour.',
    keyGenerator: 'ip'
});

// Standard: For transfer operations (per user)
const transferLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many transfer requests. Please wait a moment.',
    keyGenerator: 'user'
});

// Relaxed: For read operations
const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please slow down.',
    keyGenerator: 'ip'
});

module.exports = {
    createRateLimiter,
    authLimiter,
    signupLimiter,
    transferLimiter,
    apiLimiter
};
