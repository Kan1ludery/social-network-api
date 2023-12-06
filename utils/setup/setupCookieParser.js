const cookieParser = require("cookie-parser");
const setupCookieParser = (app) => {
    app.use(cookieParser());
}
module.exports = {setupCookieParser}