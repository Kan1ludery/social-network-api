const express = require('express');
const connect = require("../dbSafe/db");
const { authenticateToken } = require("../../utils/authenticateToken");
const router = express.Router();

// Функция для получения информации о пользователе
const getUserInfo = async (usersCollection, participantId) => {
    const user = await usersCollection.findOne({ _id: participantId });
    return {
        friendId: participantId,
        username: user ? user.username : 'Unknown',
        email: user ? user.email : 'Unknown',
        profileImage: user ? user.profile.profileImage : '',
    };
};
// Получить информацию о текущем пользователе
const getCurrentUserInfo = async (usersCollection, userId) => {
    const currentUser = await usersCollection.findOne({ _id: userId });
    return {
        friendId: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        profileImage: currentUser.profile.profileImage || '',
    };
}

// Роут для получения списка чатов пользователя
router.get('/getChats', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Коллекция пользователей
        const chatsCollection = db.collection('chats'); // Коллекция чатов
        const userId = req.user._id; // ID текущего пользователя

        // Найти все чаты, в которых участвует текущий пользователь
        const userChats = await chatsCollection.find({ participants: userId }).toArray();

        // Получить информацию о чатах и пользователях
        const chatInfoPromises = userChats.map(async (chat) => {
            // Идентификатор участника чата, который не является текущим пользователем
            const participantId = chat.participants.find(id => id !== userId);

            // Проверить, есть ли идентификатор во вторичном поле
            const actualParticipantId = participantId || chat.participantsIdForDelete;

            // Получить информацию о втором пользователе, даже если он удален
            const [userInfo] = await Promise.all([
                getUserInfo(usersCollection, actualParticipantId),
            ]);
            const [currentUserInfo] = await Promise.all([
                getCurrentUserInfo(usersCollection, userId),
            ]);
            return {
                chatId: chat.chatId,
                lastMessage: chat.lastMessage,
                friendId: actualParticipantId,  // Используем actualParticipantId
                isPersonal: chat.isPersonal || false,
                ...(chat.isPersonal ? currentUserInfo : userInfo),
            };
        });

        // Используем Promise.all для выполнения всех промисов параллельно
        const chatInfo = await Promise.all(chatInfoPromises);
        res.status(200).json(chatInfo);
    } catch (error) {
        console.error('Ошибка при получении списка чатов:', error);
        res.status(500).json({ error: 'Ошибка при получении списка чатов' });
    }
});

module.exports = router;

