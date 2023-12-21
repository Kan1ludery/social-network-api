// registration.js
const {loadEnv} = require("../../utils/loadEnv");
loadEnv()
const express = require('express');
const router = express.Router();
const connect = require('../dbSafe/db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {sanitizeInput} = require("../../utils/sanitizeInput");
const {sendVerificationEmail} = require("./emailVerifyFunc");
const secretKey = process.env.SECRET_KEY;
const {csrfProtection} = require("../../utils/csrfToken");
const {generateUId} = require("../../utils/generateUId");


// Маршрут для регистрации
router.post('/register', csrfProtection, async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Получение экземпляра коллекции "users"
        let {username, password, email} = req.body;
        // Проверка, что все обязательные поля переданы
        if (!username || !password || !email) {
            return res.status(400).json({error: 'Не указаны все обязательные поля'});
        }
        if (username.length > 15) {
            return res.status(400).json({error: 'Поле username превышает указанный лимит'});
        }
        // Экранирование данных перед добавлением в базу данных
        username = sanitizeInput(username);
        email = sanitizeInput(email);
        password = sanitizeInput(password);

        // Проверка уникальности имени пользователя и email
        const existingUser = await usersCollection.findOne({$or: [{username: username}, {email: email}]});
        console.log(existingUser)
        if (existingUser) {
            const errors = {};

            if (existingUser.username === username) {
                errors.username = 'Имя пользователя уже занято';
            }
            if (existingUser.email === email) {
                if ((email.match(/\./g) || []).length > 1) {
                    errors.email = 'Email should contain only one domain';
                } else {
                    errors.email = 'Почта уже занята';
                }
            }
            return res.status(400).json(errors);
        }

        // Проверка длины пароля (не меньше 8 символов)
        if (password.length < 8) {
            return res.status(400).json({error: 'Пароль слишком короткий'});
        }

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Генерация уникального идентификатора пользователя
        const userId = generateUId();

        // Генерация уникального токена подтверждения почты
        const emailVerificationToken = generateUId();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15); // Токен действителен 15 минут

        // Сохранение информации о пользователе в базе данных
        const newUser = {
            _id: userId,
            username,
            password: hashedPassword,
            email,
            emailVerified: false, // Статус почты (не проверенная(false)/проверенная(true))
            emailVerificationToken: emailVerificationToken, // Поле для создания токена(подтверждения почты)
            confirmationAttempts: 0, // Поле для отслеживания попыток
            expirationTime: expirationTime,
        };
        await usersCollection.insertOne(newUser);

        // Генерация JWT-токена
        const token = jwt.sign({userId: userId, emailVerified: false}, secretKey, {expiresIn: '1h'});

        // Отправка письма с подтверждением
        await sendVerificationEmail(email, emailVerificationToken);

        // Отправка JWT-токена как ответ
        res.json({message: 'Регистрация прошла успешно', token});
    } catch
        (error) {
        console.error('Ошибка при регистрации', error);
        res.status(500).json({error: 'Ошибка при регистрации'});
    }
})
;

module.exports = router;