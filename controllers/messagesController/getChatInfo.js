const express = require("express");
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");
const router = express.Router();

// Роут или функция для получения сообщений и информации о чате по chatId
router.get('/getChatInfo/:chatId/:from/:to', authenticateToken, async (req, res) => {
    try {
        const db = await connect();
        const chatsCollection = db.collection('chats');

        const chatId = req.params.chatId;
        const from = parseInt(req.params.from);
        const to = parseInt(req.params.to);
        // Находим чат по chatId
        const chat = await chatsCollection.findOne({ chatId });

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        // Получаем только сообщения в заданном диапазоне
        const messages = chat.messages.slice(from, to + 1);
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Ошибка при получении информации о чате:', error);
        res.status(500).json({ error: 'Ошибка при получении информации о чате' });
    }
});

module.exports = router