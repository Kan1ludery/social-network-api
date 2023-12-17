// index.js
const express = require('express'); // Подключение модуля express
const path = require("path")
const {setupWebSocketIO} = require("./Sockets/setupWebSocketIO");
const {setupServerControllers} = require("./controllers/setupServerControllers");
const {setupUtils} = require("./utils/setup/setupUtils");
const {loadEnv} = require("./utils/loadEnv");
const http = require("http");
loadEnv()

const app = express(); // Создание экземпляра приложения express
const port = process.env.PORT || 5060; // Порт, на котором будет запущен сервер

// serve the API with signed certificate on 443 (SSL/HTTPS) port
const server = http.createServer(app)

/** Установка всех побочных утилит */
setupUtils(app, express)

/** Устанвока всех контроллеров сервера */
setupServerControllers(app)

/** Загрузка фотографий */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Указываем путь к папке с загруженными файлами
const uploadsFolderPath = '/uploads'; // Путь, на который смонтирован том

// Настроить Express для обслуживания статических файлов из папки uploads
app.use('/uploads', express.static(uploadsFolderPath));

/** WEBSOCKETS */
setupWebSocketIO(app, server)

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
server.on('error', (error) => {
    console.error('Server error:', error);
});
// Запуск сервера на указанном порту
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Вывод сообщения о запуске сервера в консоль
});
