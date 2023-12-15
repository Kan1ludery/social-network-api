const express = require('express');
const connect = require("../dbSafe/db");
const {authenticateToken} = require("../../utils/authenticateToken");
const {generateUId} = require("../../utils/generateUId");
const router = express.Router();

// Роут для принятия запроса на добавление в друзья
router.post('/acceptFriendRequest', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const friendsCollection = db.collection('friends'); // Коллекция Friends
        const chatsCollection = db.collection('chats'); // Коллекция Friends

        const userId = req.user._id
        // Проверяем, есть ли входные данные, например, идентификатор друга (friendId)
        const {friendId} = req.body;
        if (!friendId) {
            return res.status(404).json({error: 'ID не существует'});
        }
        // Обновляем статус друга
        const result = await friendsCollection.updateOne(
            {userId: friendId}, // Фильтр для поиска друга по userId
            {$set: {status: 'accepted'}} // Устанавливаем статус как "accepted"
        );
        if (result.modifiedCount === 1) {
            // Получение ID из запросов
            const participantIds = [userId, friendId];
            // Получение имен пользователей с помощью функции
            const chatExists = await chatsCollection.findOne({
                participants: { $all: [userId, friendId] },
            });
            console.log(participantIds)
            if (chatExists) {
                return res.status(200).json({ message: 'Чат с пользователем уже существует'});
            }
            else {
                // Создание нового чата
                const chat = {
                    chatId: generateUId(),
                    title: `Чат между пользователями ${participantIds[0]} и ${participantIds[1]}`,
                    participants: participantIds,
                    messages: [],
                    lastMessage: null,
                    created_at: new Date(),
                };
                // Сохраняем новый чат в базе данных
                await chatsCollection.insertOne(chat);
                return res.status(200).json({message: 'Запрос на добавление в друзья принят'})
            }
        }
        return res.status(404).json({error: 'Друг с указанным ID не найден'});
    } catch (error) {
        console.error('Ошибка при принятии запроса на добавление в друзья:', error);
        res.status(500).json({error: 'Ошибка при принятии запроса на добавление в друзья'});
    }
});

module.exports = router;