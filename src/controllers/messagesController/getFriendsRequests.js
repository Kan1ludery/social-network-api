const express = require('express');
const connect = require("../dbSafe/db");
const {authenticateToken} = require("../../utils/authenticateToken");
const router = express.Router();

// Роут для получения списка запросов на дружбу
router.get('/getFriendsRequests', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const friendsCollection = db.collection('friends'); // Коллекция Friends
        const userId = req.user._id; // ID текущего пользователя
        // Находим все запросы на дружбу, адресованные текущему пользователю
        const friendRequests = await friendsCollection.find({
                friendId: userId, // Пользователь считается другом, если его ID находится в поле friendId
                status: 'pending', // Статус запроса на дружбу здесь может быть разным
            }
        ).toArray();

        const usersCollection = db.collection('users'); // Коллекция пользователей

        // Создаем массив для хранения информации о пользователях, отправивших запросы
        const userIds = friendRequests.map((request) => request.userId);

        const usersRequests = await usersCollection.find({
            _id: {$in: userIds},
        }).project({ _id: 1, username: 1, userId: 1, profile: {profileImage: 1}}).toArray();
        res.status(200).json({usersRequests, requestsCount: friendRequests.length});
    } catch (error) {
        console.error('Ошибка при получении списка запросов на дружбу:', error);
        res.status(500).json({error: 'Ошибка при получении списка запросов на дружбу'});
    }
});

module.exports = router;
