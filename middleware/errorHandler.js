//middleware/errorHandler.js
const path = require('path');

const errorHandler = (err, req, res, next) => {
    // Set status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Check for specific error codes
    if (statusCode === 500) {
        res.status(500);
        res.status(500).sendFile(path.join(__dirname, '..', 'views', '500', 'index.html'));
    } else {
        res.status(statusCode);
        res.json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
    }
};

module.exports = errorHandler;
