const cors = require("cors");
const setupCors = (app) => {
    const allowedOrigins = ['https://yomessage.up.railway.app'];
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