const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();
router.delete('/deleteFriendship/:userId/:friendId', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const friendsCollection = db.collection('friends'); // Коллекция друзей

        // Получаем идентификаторы пользователей из параметров запроса
        const { userId, friendId } = req.params;

        // Ищем дружбу по userId и friendId (или наоборот) и удаляем её
        const result = await friendsCollection.deleteOne({
            $or: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Дружба успешно удалена' });
        } else {
            res.status(404).json({ error: 'Дружба между указанными пользователями не найдена' });
        }
    } catch (error) {
        console.error('Ошибка при удалении дружбы:', error);
        res.status(500).json({ error: 'Ошибка при удалении дружбы' });
    }
});

module.exports = router