const csrf = require('csurf');

// Создаем CSRF-токен и устанавливаем его в куки с httpOnly
const csrfProtection = csrf({ cookie: { httpOnly: true, length: 48, secure: true} });

module.exports = { csrfProtection };
