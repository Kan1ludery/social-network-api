// authenticateToken.js
const jwt = require("jsonwebtoken");
const connect = require("../controllers/dbSafe/db");
const secretKey = process.env.SECRET_KEY;
require('dotenv').config();

// Middleware для проверки аутентификации
async function authenticateToken(req, res, next) {
    const tokenHeader = req.header('Authorization'); // Получение токена из заголовка запроса
    if (!tokenHeader) {
        return res.status(401).json({ error: 'Unauthorized: Токен отсутствует' });
    }
    const token = tokenHeader.split(' ')[1]; // Разбираем строку, чтобы получить только ту часть, которая содержит токен
    jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Неверный токен или истек срок действия' });
        }
        // Выполняем запрос к базе данных на основе userId
        try {
            const db = await connect(); // Получение экземпляра базы данных
            const collection = db.collection('users'); // Получение экземпляра коллекции "users"
            const foundUser = await collection.findOne({ _id: user.userId });

            // Проверка наличия пользователя
            if (!foundUser) {
                return res.status(401).json({ error: 'Пользователь не найден' });
            }

            // Проверка emailVerified и isBlocked
            if (!foundUser.emailVerified) {
                return res.status(403).json({ error: 'Email не подтвержден' });
            }
            if (foundUser.isBlocked) {
                return res.status(403).json({ error: 'Аккаунт заблокирован' });
            }

            // Добавление информации о пользователе в объект запроса
            req.user = foundUser;

            // Проверка роли пользователя
            if (foundUser.role === 'admin') {
                // Дополнительные действия для администраторов
            }

            next();
        } catch (error) {
            console.error('Ошибка при запросе данных пользователя:', error);
            res.status(500).json({ error: 'Ошибка при запросе данных пользователя' });
        }
    });
}

module.exports = { authenticateToken };
