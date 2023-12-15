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

    const userSocketMap = new Map();

    io.on('connection', (socket) => {
        const userId = socket.handshake.auth.userId; // Получаем userId из handshake
        socket.userId = userId; // Добавляем userId к объекту сокета
        userSocketMap.set(userId, socket);
    });
    io.on('disconnect', (socket) => {
        const userId = socket.userId; // Получаем userId из объекта сокета
        if (userId) {
            userSocketMap.delete(userId);
        }
    });

    app.set('userSocketMap', userSocketMap); // Сохраняем Map в объекте приложения Express

    return {server, io};
};

module.exports = {setupWebSocketIO};
