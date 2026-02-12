const middleware = require('./src/middleware/auth.middleware');
console.log('middleware keys:', Object.keys(middleware));
console.log('verifyToken:', typeof middleware.verifyToken);
console.log('verifyAdmin:', typeof middleware.verifyAdmin);
