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
        let searchField = 'username'; // По умолчанию ищем по имени
        // Проверяем, соответствует ли введенное значение формату email
        if (query.includes('@')) {
            searchField = 'email';
        }
        const results = await collection.findOne({[searchField]: query});
        if (!results) {
            return res.status(400).json({error: 'Такого пользователя не существует'});
        }
        const filteredResults = {
            _id: results._id,
            username: results.username,
            email: results.email,
            profileImage: results.profile.profileImage,
        };
        res.status(200).json([filteredResults]);
    } catch (error) {
        console.error('Ошибка при выполнении поиска друзей:', error);
        res.status(500).json({error: 'Ошибка при выполнении поиска друзей'});
    }
});

module.exports = router;
