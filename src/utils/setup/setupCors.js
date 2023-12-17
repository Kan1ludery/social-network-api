const cors = require("cors");
const setupCors = (app) => {
    const allowedOrigins = ['https://social-network-1udsck7b7-kans-projects-f163426e.vercel.app', 'http://localhost:3000', 'https://social-network-theta-seven.vercel.app'];
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