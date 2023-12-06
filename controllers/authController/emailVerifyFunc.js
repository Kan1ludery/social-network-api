// emailVerifyFunc.js
const nodemailer = require("nodemailer");
require('dotenv').config();

// Создайте объект для отправки электронных писем
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Функция для отправки письма с подтверждением
const sendVerificationEmail = async (email, emailVerificationToken) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Подтверждение почты",
            text: `Для подтверждения почты перейдите по ссылке: http://localhost:3001/api/confirm?token=${emailVerificationToken}&email=${email}`,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Письмо успешно отправлено: " + info.response);
    } catch (error) {
        console.error("Ошибка при отправке письма: ", error);
        throw error;
    }
};

module.exports = {sendVerificationEmail}
