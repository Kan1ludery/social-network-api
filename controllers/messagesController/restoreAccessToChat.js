const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();
router.post('/restoreAccessToChat', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id; // ID текущего пользователя
        const otherUserId = req.body.otherUserId // ID пользователя чата
        const chatId = req.body.chatId; // ID чата, который нужно обновить

        const db = await connect(); // Получение экземпляра базы данных
        const chatsCollection = db.collection('chats'); // Коллекция чатов

        const participantsToAdd = [userId, otherUserId]; // Определить список участников для добавления

        // Обновление данных чата
        const result = await chatsCollection.updateOne(
            { chatId: chatId },
            {
                $addToSet: {
                    participants: { $each: participantsToAdd }
                },
                $unset: { participantsIdForDelete: '' } // Убираем participantsIdForDelete
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: 'Чат не найден или не был изменен' });
        }
    } catch (error) {
        console.error('Ошибка при восстановлении доступа к чату:', error);
        res.status(500).json({ error: 'Ошибка при восстановлении доступа к чату' });
    }
});

module.exports = router
