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
router.post('/register', async (req, res) => {
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Получение экземпляра коллекции "users"
        const personalChatsCollection = db.collection('personalChats')
        let {username, password, email} = req.body;
        // Проверка, что все обязательные поля переданы
        if (!username || !password || !email) {
            return res.status(400).json({error: 'Не указаны все обязательные поля'});
        }

        // Экранирование данных перед добавлением в базу данных
        username = sanitizeInput(username);
        email = sanitizeInput(email);
        password = sanitizeInput(password);

        // Проверка уникальности имени пользователя и email
        const existingUser = await usersCollection.findOne({$or: [{username: username}, {email: email}]});

        if (existingUser) {
            const errors = {};

            if (existingUser.username === username) {
                errors.username = 'Имя пользователя уже занято';
            }
            if (existingUser.email === email) {
                errors.email = 'Почта уже занята';
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

        // Генерация refresh-токена для замены старому jwt-токену
        const refreshToken = generateUId(); // Генерация Refresh Token
        const expirationTimeRefresh = new Date();
        expirationTimeRefresh.setDate(expirationTimeRefresh.getDate() + 30); // Refresh Token действителен 30 дней

        // Сохранение информации о пользователе в базе данных
        const newUser = {
            _id: userId,
            username,
            password: hashedPassword,
            email,
            role: 'user',
            emailVerified: false, // Статус почты (не проверенная(false)/проверенная(true))
            emailVerificationToken: emailVerificationToken, // Поле для создания токена(подтверждения почты)
            confirmationAttempts: 0, // Поле для отслеживания попыток
            expirationTime: expirationTime, // Добавьте поле для срока действия токена
            isBlocked: false,
            refreshToken: refreshToken, // Сохранение Refresh Token
            expirationTimeRefresh: expirationTimeRefresh, // Срок действия Refresh Token
            profile: {
                profileImage: '', // Замените на фактический URL изображения
                states: {}, // Здесь будет список состояний
                socialLinks: {}, // Ссылки на соц. сети.
                description: '', // Описание профиля
            },

        };
        await usersCollection.insertOne(newUser);

        // Создание персонального чата
        const personalChat = {
            chatId: generateUId(),
            title: `Личный чат ${newUser.username}`,
            participants: [newUser._id],
            messages: [],
            lastMessage: null,
            created_at: new Date(),
            isPersonal: true,
        };
        await personalChatsCollection.insertOne(personalChat)
        // Генерация JWT-токена
        const token = jwt.sign({userId: newUser._id, emailVerified: newUser.emailVerified}, secretKey, {expiresIn: '1h'});

        // Отправка письма с подтверждением
        await sendVerificationEmail(newUser.email, emailVerificationToken);

        // Отправка токена в куки с HttpOnly
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000}); // Устанавливает refreshToken в куках

        // Отправка JWT-токена как ответ
        res.json({message: 'Регистрация прошла успешно', token});
    } catch (error) {
        console.error('Ошибка при регистрации', error);
        res.status(500).json({error: 'Ошибка при регистрации'});
    }

});

module.exports = router;