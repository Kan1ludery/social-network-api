// setupSocketOne.js
const socketIo = require('socket.io');
const setupSocketOne = (app, server) => {
    const io1 = socketIo(server, {
        cors: {
            origin: ['https://social-network-1udsck7b7-kans-projects-f163426e.vercel.app', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    app.set('socketIO', io1); // Устанавливаем io в объект приложения Express

    const userSocketMap = new Map();

    io1.on('connection', (socket) => {
        const userId = socket.handshake.auth.userId; // Получаем userId из handshake
        socket.userId = userId; // Добавляем userId к объекту сокета
        userSocketMap.set(userId, socket);
    });
    io1.on('disconnect', (socket) => {
        const userId = socket.userId; // Получаем userId из объекта сокета
        if (userId) {
            userSocketMap.delete(userId);
        }
    });

    app.set('userSocketMap', userSocketMap); // Сохраняем Map в объекте приложения Express

    return io1
};

module.exports = {setupSocketOne}