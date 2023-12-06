const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();

// Роут для получения случайных пользователей
router.get('/getRandomUsers', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id; // ID текущего пользователя

        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Коллекция пользователей
        const chatsCollection = db.collection('chats'); // Коллекция чатов

        // Получить случайных пользователей, исключая текущего пользователя
        const randomUsers = await usersCollection.aggregate([
            { $match: { _id: { $ne: userId } } }, // Исключить текущего пользователя
            { $sample: { size: 5 } }, // Выбрать случайных пользователей
            { $project: { _id: 1, username: 1, email: 1, profile: { profileImage: 1 } } } // Выбрать нужные поля
        ]).toArray();

        // Проверить отсутствие чатов между текущим пользователем и выбранными случайными пользователями
        const chatExistencePromises = randomUsers.map(async (randomUser) => {
            const chat = await chatsCollection.findOne({
                participants: { $all: [userId, randomUser._id] }
            });

            return {
                userId: randomUser._id,
                chatExists: !!chat,
            };
        });

        const chatExistenceResults = await Promise.all(chatExistencePromises);

        // Отфильтровать случайных пользователей, с которыми не существует чата
        const usersWithoutChat = randomUsers.filter((randomUser, index) => !chatExistenceResults[index].chatExists);

        // Вернуть информацию о случайных пользователях без чата
        res.status(200).json(usersWithoutChat);
    } catch (error) {
        console.error('Ошибка при получении случайных пользователей:', error);
        res.status(500).json({ error: 'Ошибка при получении случайных пользователей' });
    }
});

module.exports = router;
