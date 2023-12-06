const express = require('express');
const connect = require("../dbSafe/db");
const {generateUId} = require("../../utils/generateUId");
const {authenticateToken} = require("../../utils/authenticateToken");
const router = express.Router();

// Роут для создания чата между двумя пользователями
router.post('/createChat', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Коллекция пользователей
        const chatsCollection = db.collection('chats'); // Коллекция чатов

        // Получить идентификаторы двух пользователей из тела запроса
        const userId1 = req.user._id;
        const userId2 = req.body.userId2;
        console.log(userId1, userId2)

        // Проверить, что пользователи существуют в базе данных
        const usersExist = await usersCollection.countDocuments({ _id: { $in: [userId1, userId2] } });

        if (usersExist !== 2) {
            return res.status(400).json({ error: 'Один или оба пользователя не найдены в базе данных' });
        }


        // Создать уникальный идентификатор для чата
        const chatId = generateUId();

        // Создать новый чат
        const newChat = {
            chatId: chatId,
            participants: [userId1, userId2],
            participantsIdForDelete: [], // Инициализировать поле для удаления
            messages: [],
            lastMessage: {},
            created_at: new Date(),
        };

        // Вставить новый чат в коллекцию
        await chatsCollection.insertOne(newChat);

        // Вернуть информацию о новом чате
        res.status(200).json(newChat);
    } catch (error) {
        console.error('Ошибка при создании чата:', error);
        res.status(500).json({ error: 'Ошибка при создании чата' });
    }
});

module.exports = router;
