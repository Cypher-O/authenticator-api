//middleware/notFound.js
const path = require('path');

const notFound = (req, res, next) => {
    res.status(404);
    res.sendFile(path.join(__dirname, '..', 'views', '404', 'index.html'));
};

module.exports = notFound;
