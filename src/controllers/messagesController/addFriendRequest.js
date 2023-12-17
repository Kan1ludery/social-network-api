// addFriendRequest.js
const express = require('express');
const connect = require("../dbSafe/db");
const {authenticateToken} = require("../../utils/authenticateToken");
const {generateUId} = require("../../utils/generateUId");
const router = express.Router();

// Роут для создания друзей пользователя
const setupAddFriendRequest = (app) => {
    router.post('/addFriendRequest', authenticateToken, async (req, res) => {
        try {
            const db = await connect(); // Получение экземпляра базы данных
            const usersCollection = db.collection('users'); // Коллекция пользователей
            const friendsCollection = db.collection('friends'); // Коллекция друзей
            const userId = req.user._id; // ID текущего пользователя
            const {friendId} = req.body; // ID друга, которого нужно добавить
            const statusFriendship = 'pending'; // Начальный статус, например, "ожидает подтверждения"

            // Проверяем, существует ли пользователь
            const existingUser = await usersCollection.findOne({_id: userId});
            if (!existingUser) {
                return res.status(401).json({error: 'Пользователя который хочет добавить в друзья не существует'});
            }
            // Проверяем, существует ли пользователь с указанным ID
            const friend = await usersCollection.findOne({_id: friendId});
            if (!friend) {
                return res.status(404).json({error: 'Пользователь не найден'});
            }
            // Проверяем, что пользователь не пытается добавить самого себя
            if (existingUser._id === friendId) {
                return res.status(400).json({error: 'Вы не можете добавить себя в друзья'});
            }
            // Проверяем, не добавлен ли пользователь уже в друзья
            const isAlreadyFriend = await friendsCollection.findOne({
                $or: [
                    {userId, friendId},
                    {userId: friendId, friendId: userId, status: 'accepted'},
                ],
            });
            if (isAlreadyFriend) {
                return res.status(400).json({error: 'Этот пользователь уже есть в вашем списке друзей'});
            }
            // Проверяем, не отправлял ли пользователь запрос на добавление в друзья
            const isFriendshipRequestSent = await friendsCollection.findOne({userId: friendId, friendId: userId});
            if (isFriendshipRequestSent) {
                return res.status(400).json({error: 'Запрос на добавление в друзья уже создан'});
            }
            const friendship = {
                _id: generateUId(),
                userId: userId,
                friendId: friendId,
                status: statusFriendship,
            };
            // Создаем запись о дружбе в коллекции друзей
            await friendsCollection.insertOne(friendship);
            const io = req.app.get('socketIO');
            if (!io) {
                console.error('Ошибка: объект io не был найден или не установлен.');
                return res.status(500).send('Ошибка: объект io не был найден или не установлен.');
            }
            const userSocketMap = app.get('userSocketMap');
            console.log(userSocketMap)
            // Далее, чтобы отправить сообщение конкретному пользователю по его ID:
            const socket = userSocketMap.get(friendId);
            if (socket) {
                socket.emit('friendAdded', { message: 'Ваш друг был успешно добавлен' });
            }
            res.status(200).json({message: 'Пользователь успешно добавлен в список друзей'});
        } catch (error) {
            console.error('Ошибка при добавлении друга:', error);
            res.status(500).json({error: 'Ошибка при добавлении друга'});
        }
    });
    return router
}

module.exports = setupAddFriendRequest;
