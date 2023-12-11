const express = require('express');
const connect = require("../dbSafe/db");
const {sanitizeInput} = require("../../utils/sanitizeInput");
const {authenticateToken} = require("../../utils/authenticateToken");
const router = express.Router();

router.get('/friends-search', authenticateToken, async (req, res) => {
    try {
        let {query} = req.query;
        const db = await connect(); // Получение экземпляра базы данных
        const collection = db.collection('users'); // Получение экземпляра коллекции "users"
        // Проверка на пустой input и query
        if (!query) {
            return res.status(400).json({error: 'Не указано обязательное поле'});
        }
        query = sanitizeInput(query);
        // Создаем регулярное выражение для частичного совпадения
        const regex = new RegExp(query, 'i'); // 'i' - игнорирование регистра

        // Ищем пользователей, чьи имена или email соответствуют частичному совпадению с запросом
        const results = await collection.find({
            $or: [
                { username: { $regex: regex } }, // Поиск по имени
                { email: { $regex: regex } }, // Поиск по email
            ],
        }).toArray();

        if (!results || results.length === 0) {
            return res.status(400).json({ error: 'Таких пользователей не существует' });
        }
        // Формируем отфильтрованный список найденных пользователей
        const filteredResults = results.map((user) => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profile.profileImage,
        }));

        res.status(200).json(filteredResults);
    } catch (error) {
        console.error('Ошибка при выполнении поиска друзей:', error);
        res.status(500).json({error: 'Ошибка при выполнении поиска друзей'});
    }
});

module.exports = router;
