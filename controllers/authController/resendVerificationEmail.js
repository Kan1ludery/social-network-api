const express = require("express");
const {sendVerificationEmail} = require("./emailVerifyFunc");
const {generateUId} = require("../../utils/generateUId");
const connect = require("../dbSafe/db");
const router = express.Router();

router.post('/resendVerificationEmail', async (req, res) => {
    try {
        const db = await connect(); // Установка соединения с базой данных
        const collection = db.collection('users'); // Получение коллекции "users" из базы данных

        const userId = req.body.userId // Получаем userId из JWT токена
        const user = await collection.findOne({_id: userId}); // Находим пользователя по userId

        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        // Проверка количества попыток подтверждения
        if (user.confirmationAttempts >= 3) {
            return res.status(403).send({error: "Превышено количество попыток подтверждения."});
        }

        const {email} = user; // Получаем email пользователя из базы данных

        // Генерируем новый токен для подтверждения почты и время истечения
        const emailVerificationToken = generateUId();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15); // Токен действителен 15 минут

        // Обновляем emailVerificationToken в базе данных
        await collection.updateOne({_id: user._id}, {$set: {emailVerificationToken, expirationTime}, $inc: {confirmationAttempts: 1}});

        // Отправляем письмо с подтверждением
        await sendVerificationEmail(email, emailVerificationToken);

        res.send('Письмо с подтверждением отправлено успешно!');
    } catch (error) {
        console.error('Ошибка при отправке письма: ', error);
        res.status(500).send('Ошибка при отправке письма');
    }
});

module.exports = router;
