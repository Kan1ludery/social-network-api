// index.js
const express = require('express'); // Подключение модуля express
const path = require("path")
const {setupWebSocketOnlineStatus} = require("./Sockets/socketOnlineStatus;");
const {setupWebSocketMessages} = require("./Sockets/socketMessages");
const {setupWebSocketIO} = require("./Sockets/setupWebSocketIO");
const {setupServerControllers} = require("./controllers/setupServerControllers");
const {setupUtils} = require("./utils/setup/setupUtils");
const {loadEnv} = require("./utils/loadEnv");
const https = require("https");
const fs = require("fs");
loadEnv()

const app = express(); // Создание экземпляра приложения express
const port = process.env.PORT || 5060; // Порт, на котором будет запущен сервер

const options = {
    key: fs.readFileSync('./utils/perKey.pem'),
    cert: fs.readFileSync('./utils/certificate.pem'),
}

// serve the API with signed certificate on 443 (SSL/HTTPS) port
const server = https.createServer(options, app);
console.log(server)

/** Установка всех побочных утилит */
setupUtils(app, express)

/** Устанвока всех контроллеров сервера */
setupServerControllers(app)

/** Загрузка фотографий */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/** WEBSOCKETS */
setupWebSocketIO(app, server)
const serverMsg = app.listen(8080);
setupWebSocketMessages(serverMsg); // Вызов функции для настройки WebSocket-сервера
const serverOnl = app.listen(8081);
setupWebSocketOnlineStatus(serverOnl);

// Маршрут для корневого URL-адреса API
app.get('/', (req, res) => {
    res.send(`API IS RUNNING`); // Отправка ответа для API
});

// Маршрут для получения объекта одного пользователя
app.get('/api/usersList', (req, res) => {
    // Ваш объект пользователя (можете заменить на свои данные)
    const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        car: 'red'
    };

    res.json(user); // Отправка объекта в формате JSON в ответ на запрос
});

// Запуск сервера на указанном порту
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Вывод сообщения о запуске сервера в консоль
});
