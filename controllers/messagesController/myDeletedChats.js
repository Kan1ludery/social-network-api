const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();
router.get('/myDeletedChats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id; // ID текущего пользователя

        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Коллекция пользователей
        const chatsCollection = db.collection('chats'); // Коллекция чатов

        // Шаг 1: Поиск чатов, где текущий пользователь удалил доступ
        const myDeletedChats = await chatsCollection.find({
            participantsIdForDelete: userId, // Имеется поле participantsIdForDelete для текущего пользователя
            $expr: { $eq: [{ $size: '$participants' }, 1] }, // В чате только один участник
        }).toArray();

        // Шаг 2: Собираем объект с данными пользователя и chatId
        const result = [];
        for (const chat of myDeletedChats) {
            const otherUserId = chat.participants.find(id => id !== userId);
            if (otherUserId) {
                const userData = await usersCollection.findOne(
                    { _id: otherUserId },
                    { projection: { _id: 1, username: 1, profile: 1 } }
                );
                if (userData) {
                    userData.chatId = chat.chatId; // Добавляем chatId к данным пользователя
                    result.push(userData);
                }
            }
        }

        // Шаг 3: Возвращаем объединенные данные пользователей из чатов
        res.status(200).json(result);
    } catch (error) {
        console.error('Ошибка при получении чатов пользователя:', error);
        res.status(500).json({ error: 'Ошибка при получении чатов пользователя' });
    }
});

module.exports = router