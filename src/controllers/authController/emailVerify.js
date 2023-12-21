// EmailVerifyController.js
const {loadEnv} = require("../../utils/loadEnv");
const express = require("express");
const connect = require("../dbSafe/db");
const router = express.Router();
loadEnv()
const jwt = require("jsonwebtoken");
const path = require("path");
const {generateUId} = require("../../utils/generateUId");
const secretKey = process.env.SECRET_KEY;


router.get("/confirm", async (req, res) => {
    const {token, email} = req.query; // Получаем токен и email из query параметров (URL)
    try {
        const db = await connect(); // Получение экземпляра базы данных
        const usersCollection = db.collection('users'); // Получение экземпляра коллекции "users"
        const chatsCollection = db.collection('chats')
        // Поиск пользователя по токену и email
        const user = await usersCollection.findOne({emailVerificationToken: token, email: email});
        // Проверка токена и email
        if (!user) {
            return res.send("Ошибка при подтверждении почты: неверный токен.");
        }
        // Проверка срока действия токена
        const currentTime = new Date() // Установка временной зоны
        if (currentTime > user.expirationTime) {
            return res.status(403).send("Срок действия токена истек."); // Срок действия подтверждения почты истёк*
        }
        // Проверка критических ошибок при запросе
        if (user.confirmationAttempts > 2) {
            const errorText = "Превышено количество попыток подтверждения.";
            res.render('error', { error: errorText });
            return res.status(403).send({error: "Превышено количество попыток подтверждения."});
        }
        // Генерация refresh-токена для замены старому jwt-токену
        const refreshToken = generateUId(); // Генерация Refresh Token
        const expirationTimeRefresh = new Date();
        expirationTimeRefresh.setDate(expirationTimeRefresh.getDate() + 30); // Refresh Token действителен 30 дней

        // Обновление статуса подтверждения почты
        await usersCollection.updateOne({_id: user._id}, {
            $set: {
                emailVerified: true,
                role: 'user',
                isBlocked: false,
                refreshToken: refreshToken, // Сохранение Refresh Token
                expirationTimeRefresh: expirationTimeRefresh, // Срок действия Refresh Token
                profile: {
                    profileImage: '', // Замените на фактический URL изображения
                    states: {}, // Здесь будет список состояний
                    socialLinks: {}, // Ссылки на соц. сети.
                    description: '', // Описание профиля
                },
            }
        });
        // Создание персонального чата
        const personalChat = {
            chatId: generateUId(),
            title: `Личный чат ${user.username}`,
            participants: [user._id],
            messages: [],
            lastMessage: null,
            created_at: new Date(),
            isPersonal: true,
        };
        await chatsCollection.insertOne(personalChat)

        // Отправка токена в куки с HttpOnly
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // Время жизни куки в миллисекундах (30 дней)
            domain: 'yomessage-api.ru', // Домен, на котором куки будут доступны
            path: '/', // Путь, для которого будут доступны куки (корневой путь)
            secure: true, // HTTPS (требуется для безопасности)
        });
        // Отправка события по сокету при успешном подтверждении почты

        const io = req.app.get('socketIO'); // Получаем объект io из приложения Express
        // Проверка наличия объекта io

        if (!io) {
            console.error('Ошибка: объект io не был найден или не установлен.');
            return res.status(500).send('Ошибка: объект io не был найден или не установлен.');
        }
        const newToken = jwt.sign({
            userId: user._id, emailVerified: true // Обновленный статус emailVerified
        }, secretKey, {expiresIn: '1h'});
        io.emit('emailVerified', {newToken}); // Отправляем событие
        res.sendFile(path.join(__dirname, 'success.html'));
    } catch (error) {
        console.error("Ошибка при подтверждении почты: ", error);
        res.send("Ошибка при подтверждении почты.");
    }
})


module.exports = router;

