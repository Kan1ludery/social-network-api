const cors = require("cors");
const setupCors = (app) => {
    const allowedOrigins = ['social-network-production.up.railway.app', 'http://localhost:3000', 'https://social-network-theta-seven.vercel.app'];
    app.use(cors({
        origin: function (origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));
}
module.exports = {setupCors}