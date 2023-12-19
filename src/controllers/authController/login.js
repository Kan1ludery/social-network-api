// login.js
const {loadEnv} = require("../../utils/loadEnv");
loadEnv()
const express = require('express');
const router = express.Router();
const connect = require('../dbSafe/db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {sanitizeInput} = require("../../utils/sanitizeInput");
const secretKey = process.env.SECRET_KEY;
const {csrfProtection} = require("../../utils/csrfToken");
// ЛОГИН
router.post('/login', async (req, res) => {
    try {
        const db = await connect();
        const collection = db.collection('users');
        let {email, password} = req.body;

        email = sanitizeInput(email);
        password = sanitizeInput(password);

        // Проверка, что обязательные поля переданы
        if (!email || !password || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({error: 'Не все обязательные поля были введены'});
        }
        // Поиск пользователя по email пользователя
        const user = await collection.findOne({email});

        if (!user) {
            return res.status(401).json({error: 'Неверные учетные данные'}); // Неверный  логин
        }

        // Проверка пароля
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({error: 'Неверные учетные данные'}); // Неверный  пароль
        }
        // Регистрация jwt token для пользователя
        const token = jwt.sign({userId: user._id, emailVerified: user.emailVerified}, secretKey, {expiresIn: '15s'}); // Срок действия токена - 1час
        //Получение refreshToken с базы данных
        const refreshToken = user.refreshToken
        // Отправка токена в куки с HttpOnly (изменить sameSite на 'none', domain на '', secure на 'true', когда выйду на продакшн)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            domain: 'localhost',
            path: '/',
            secure: false
        })
        // Успешный вход в систему
        res.json({message: 'Вход выполнен успешно', token});
    } catch (error) {
        console.error('Ошибка при входе', error);
        res.status(500).json({error: 'Ошибка при входе'});
    }
});

module.exports = router;