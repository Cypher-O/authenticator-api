// middleware/loggingMiddleware.js
const loggingMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
};

module.exports = loggingMiddleware;
