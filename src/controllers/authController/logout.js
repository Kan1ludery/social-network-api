// logout.js
const express = require('express');
const router = express.Router();


// LOGOUT Маршрут для выхода из системы
router.post('/logout', (req, res) => {
    try {
        // Очистка куки
        res.clearCookie('refreshToken', {path: '/', domain: 'yomessage-api.ru', secure: true, httpOnly: true})
        res.clearCookie('_csrf', {path: '/', domain: 'yomessage-api.ru', secure: true, httpOnly: true});
        res.sendStatus(200); // Отправьте успешный статус в ответе
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({error: 'Ошибка при выходе'});
    }
});

module.exports = router;
