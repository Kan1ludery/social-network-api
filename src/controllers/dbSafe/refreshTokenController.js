// refreshTokenController.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connect = require('./db');
const {generateUId} = require("../../utils/generateUId");
const secretKey = process.env.SECRET_KEY;
require('dotenv').config();


router.post('/refresh-token', async (req, res) => {
    try {
        // Получение refresh-token с куки клиента
        const refreshToken = req.cookies.refreshToken;

        // Проверка refresh-token на его существование
        if (!refreshToken) {
            return res.status(403).json({error: 'Forbidden: Refresh Token отсутствует'});
        }
        const db = await connect();
        const collection = db.collection('users');

        // Проверка валидности Refresh Token
        const user = await collection.findOne({refreshToken: refreshToken});
        if (!user) {
            return res.status(403).json({error: 'Неверный Refresh Token'});
        }

        // Проверка срока действия Refresh Token
        const currentTimestamp = new Date();
        if (user.expirationTimeRefresh < currentTimestamp) {
            // Срок действия Refresh Token истек
            const newRefreshToken = generateUId(); // Генерация нового Refresh Token
            const expirationTimeRefresh = new Date();
            expirationTimeRefresh.setDate(expirationTimeRefresh.getDate() + 30); // Устанавливаем новый срок действия Refresh Token
            // Обновляем Refresh Token и expirationTimeRefresh в базе данных для текущего пользователя
            await collection.updateOne({_id: user._id}, {
                $set: {
                    refreshToken: newRefreshToken, expirationTimeRefresh: expirationTimeRefresh,
                },
            });
            // Теперь можно создать новый JWT-токен
            const newToken = jwt.sign({userId: user._id, emailVerified: user.emailVerified}, secretKey, {expiresIn: '1h'});
            // Устанавливаем куку с новым Refresh Token
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true, expires: expirationTimeRefresh,
            });
            // Возвращаем только новый JWT-токен в ответ
            return res.json({newToken});
        }
        // Генерация нового JWT-токена
        const newToken = jwt.sign({userId: user._id, emailVerified: user.emailVerified}, secretKey, {expiresIn: '1h'});
        return res.json({newToken});
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;
