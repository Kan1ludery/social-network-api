const socketIo = require('socket.io');
const http = require('http');

const setupWebSocketIO = (app) => {
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    app.set('socketIO', io); // Устанавливаем io в объект приложения Express

    io.on('connection', (socket) => {
        console.log('Новое соединение:', socket.id);
    });
    io.on('disconnect', () => {
        console.log('Пользователь отключился');
    });

    return { server, io };
};

module.exports = { setupWebSocketIO };
