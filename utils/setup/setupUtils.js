const {setupHelmet} = require("./setupHelmet");
const {setupCors} = require("./setupCors");
const {setupJson} = require("./setupJson");
const {setupCookieParser} = require("./setupCookieParser");
const setupUtils = (app, express) => {
    // Включить CSP
    setupHelmet(app)
    // Разрешить запросы с определенных доменов (заменить на используемый домен)
    setupCors(app)
    // Использование middleware для разбора JSON-запросов
    setupJson(app, express)
    // CookieParser для чтения куки с клиента
    setupCookieParser(app)
}
module.exports = {setupUtils}