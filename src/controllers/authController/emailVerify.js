// EmailVerifyController.js
const {loadEnv} = require("../../utils/loadEnv");
const express = require("express");
const connect = require("../dbSafe/db");
const router = express.Router();
loadEnv()
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const setupEmailVerification = () => {
    router.get("/confirm", async (req, res) => {
        const {token, email} = req.query; // Получаем токен и email из query параметров (URL)
        try {
            const db = await connect(); // Получение экземпляра базы данных
            const collection = db.collection('users'); // Получение экземпляра коллекции "users"

            // Поиск пользователя по токену и email
            const user = await collection.findOne({emailVerificationToken: token, email: email});

            // Проверка токена и email
            if (!user) {
                return res.send("Ошибка при подтверждении почты: неверный токен или email.");
            }
            // Проверка срока действия токена
            const currentTime = new Date() // Установка временной зоны
            if (currentTime > user.expirationTime) {
                return res.status(403).send("Срок действия токена истек."); // Срок действия подтверждения почты истёк*
            }
            // Проверка критических ошибок при запросе
            if (user.confirmationAttempts > 3) {
                return res.status(403).send({error: "Превышено количество попыток подтверждения."});
            }
            // Обновление статуса подтверждения почты
            await collection.updateOne({_id: user._id}, {$set: {emailVerified: true}, $inc: {confirmationAttempts: 1}});
            // Отправка события по сокету при успешном подтверждении почты

            const io = req.app.get('socketIO'); // Получаем объект io из приложения Express
            // Проверка наличия объекта io
            if (!io) {
                console.error('Ошибка: объект io не был найден или не установлен.');
                return res.status(500).send('Ошибка: объект io не был найден или не установлен.');
            }
            const newToken = jwt.sign(
                {
                    userId: user._id,
                    emailVerified: true // Обновленный статус emailVerified
                },
                secretKey,
                { expiresIn: '1h' }
            );
            io.emit('emailVerified', { newToken }); // Отправляем событие
            res.send("Почта успешно подтверждена!");

        } catch (error) {
            console.error("Ошибка при подтверждении почты: ", error);
            res.send("Ошибка при подтверждении почты.");
        }
    })
    return router; // Возвращаем созданный роутер
};

module.exports = setupEmailVerification;

