const csrf = require('csurf');

// Создаем CSRF-токен и устанавливаем его в куки с httpOnly
const csrfProtection = csrf({ cookie: { httpOnly: true, length: 48} });

module.exports = { csrfProtection };
