const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");

const router = express.Router();

// Роут для получения списка друзей пользователя
router.get('/friends', authenticateToken, async (req, res) => {
    try {
        const db = await connect();
        const usersCollection = db.collection('users'); // Коллекция Users
        const friendsCollection = db.collection('friends');

        const userId = req.user._id; // Получаем идентификатор текущего пользователя

        // Ищем записи, где userId или friendId равен идентификатору текущего пользователя
        const userFriends = await friendsCollection.find({
            $or: [
                { userId: userId },
                { friendId: userId }
            ],
            status: 'accepted' // Можно добавить дополнительный фильтр для принятых друзей
        }).toArray();

        // Получение идентификаторов друзей
        const friendIds = userFriends.map(friend => {
            if (friend.userId === userId) {
                return friend.friendId;
            } else {
                return friend.userId;
            }
        });

        // Ищем пользователей в usersCollection по их идентификаторам
        const friendData = await usersCollection.find({
            _id: { $in: friendIds }
        }).toArray();

        // Сортируем данные и отправляем только нужные поля
        const filteredFriends = friendData.map(friend => {
            return {
                _id: friend._id,
                username: friend.username,
                email: friend.email,
                profile: {
                    profileImage: friend.profile.profileImage
                }
            };
        });
        // Подсчет количества друзей
        const friendCount = filteredFriends.length;

        // Далее можно форматировать данные, если необходимо, и отправить список друзей клиенту
        res.status(200).json({ friends: filteredFriends, friendCount });
    } catch (error) {
        console.error('Ошибка при получении списка друзей:', error);
        res.status(500).json({ error: 'Ошибка при получении списка друзей' });
    }
});

module.exports = router;
