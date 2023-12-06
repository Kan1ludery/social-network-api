const helmet = require("helmet");
const setupHelmet = (app) => {
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-scripts.com'],
            // Другие директивы...
        },
    }));
}

module.exports = {setupHelmet}