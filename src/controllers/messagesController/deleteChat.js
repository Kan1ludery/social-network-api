const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();

// Роут для удаления чата для одного пользователя
router.delete('/deleteChat/:chatId', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const chatsCollection = db.collection('chats'); // Коллекция чатов
        const userId = req.user._id; // ID текущего пользователя
        const chatIdToDelete = req.params.chatId;

        // Найти чат для удаления
        const chatToDelete = await chatsCollection.findOne({ chatId: chatIdToDelete, participants: userId });

        if (!chatToDelete) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        // Обновить информацию о чате, добавив вторичное поле для удаления
        await chatsCollection.updateOne(
            { chatId: chatIdToDelete, participants: userId },
            {
                $pull: { participants: userId },
                $set: { participantsIdForDelete: userId }
            }
        );

        // Получить обновленную информацию о чате
        const updatedChat = await chatsCollection.findOne({ chatId: chatIdToDelete });


        // Проверить, остались ли еще участники в чате
        if (updatedChat.participants.length === 0) {
            // Если нет, можно удалить весь чат
            await chatsCollection.deleteOne({ chatId: chatIdToDelete });
        }

        // Вернуть обновленную информацию о чате для текущего пользователя
        return res.status(200).json(updatedChat);
    } catch (error) {
        console.error('Ошибка при удалении чата:', error);
        res.status(500).json({ error: 'Ошибка при удалении чата' });
    }
});

module.exports = router;
