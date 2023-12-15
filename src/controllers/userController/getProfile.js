const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");

router.get('/profile/:username', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Установка соединения с базой данных
        const collection = db.collection('users'); // Получение коллекции "users" из базы данных
        const username = req.params.username
        // Извлеките информацию о текущем пользователе, используя информацию из JWT токена (например, req.user).
        const user = await collection.findOne({username: username}, {
            projection: {
                email: 1,
                username: 1,
                profile: {profileImage: 1, socialLinks: 1, description: 1}
            }
        });
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        res.json(user); // Отправка данных о пользователе в формате JSON в ответе
    } catch (error) {
        console.error('Failed to fetch user profile', error); // Вывод сообщения об ошибке в консоль
        res.status(500).json({error: 'Failed to fetch user profile'}); // Отправка сообщения об ошибке в ответе
    }
});

module.exports = router