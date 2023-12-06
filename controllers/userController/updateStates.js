// Пример Express.js роута updateStates
const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db"); // Подключите вашу базу данных

router.post('/updateStates', authenticateToken, async (req, res) => {
    try {
        const db = await connect(); // Установка соединения с базой данных
        const usersCollection = db.collection('users')
        const { isCompressed } = req.body;
        const userId = req.user._id;
        if (!userId) {
            return null
        }
        const existingUser = await usersCollection.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(500).json({ error: 'Ошибка, такого пользователя не существует' });
        }
        await usersCollection.updateOne(
            { _id: userId },
            {
                $set: {
                    'profile.states.isCompressed': isCompressed,
                },
            }
        );

        res.status(200).json({ isCompressed });
    } catch (error) {
        console.error('Ошибка при обновлении состояния:', error);
        res.status(500).json({ error: 'Ошибка при обновлении состояния' });
    }
});

module.exports = router;
