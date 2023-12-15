const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();

// Роут для отклонения запроса на добавление в друзья
router.delete('/rejectFriendRequest/:friendId', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const friendsCollection = db.collection('friends'); // Коллекция друзей

        // Проверяем, есть ли входные данные, например, идентификатор друга (friendId)
        const { friendId } = req.params;
        if (!friendId) {
            return res.status(404).json({ error: 'ID не существует' });
        }
        const userId = req.user._id

        // Удаляем запись из коллекции друзей
        const result = await friendsCollection.deleteOne({ userId: friendId, friendId: userId });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Запрос на добавление в друзья отклонен' });
        }
        else res.status(404).json({ error: 'Друг с указанным идентификатором не найден' });
    } catch (error) {
        console.error('Ошибка при отклонении запроса на добавление в друзья:', error);
        res.status(500).json({ error: 'Ошибка при отклонении запроса на добавление в друзья' });
    }
});

module.exports = router;