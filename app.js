// app.js
const express = require('express'); // Подключение модуля express
const path = require('path')
const {setupWebSocketOnlineStatus} = require("./Sockets/socketOnlineStatus;");
const {setupServerControllers} = require("./controllers/setupServerControllers");
const {setupUtils} = require("./utils/setup/setupUtils");
const {setupWebSocketMessages} = require("./Sockets/socketMessages");
const {setupWebSocketIO} = require("./Sockets/setupWebSocketIO");

const app = express(); // Создание экземпляра приложения express
const port = 3001; // Порт, на котором будет запущен сервер

/** Установка всех побочных утилит */
setupUtils(app, express)

/** Устанвока всех контроллеров сервера */
setupServerControllers(app)

/** Загрузка фотографий */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/** WEBSOCKETS */
const {server} = setupWebSocketIO(app)
const serverMsg = app.listen(8080);
setupWebSocketMessages(serverMsg); // Вызов функции для настройки WebSocket-сервера
const serverOnl = app.listen(8081);
setupWebSocketOnlineStatus(serverOnl);

// Маршрут для корневого URL-адреса API
app.get('/', (req, res) => {
    res.send(`API IS RUNNING`); // Отправка ответа для API
});

// Запуск сервера на указанном порту
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Вывод сообщения о запуске сервера в консоль
});
