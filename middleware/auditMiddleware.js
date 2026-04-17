const AuditLog = require('../models/AuditLog');

const auditLogger = (action) => {
    return async (req, res, next) => {
        // We only care about successful mutations for audit trail usually, 
        // but we'll log the attempt.
        const originalSend = res.send;

        res.send = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Async log without awaiting to not block response
                AuditLog.create({
                    userId: req.user?._id,
                    action: action || `Admin action: ${req.method} ${req.originalUrl}`,
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }).catch(err => console.error('Audit Log Error:', err));
            }
            return originalSend.apply(res, arguments);
        };

        next();
    };
};

module.exports = auditLogger;
