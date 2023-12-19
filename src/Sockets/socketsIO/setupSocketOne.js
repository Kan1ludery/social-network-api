const setupSocketOne = (app, mainSocket) => {

    const socketIO1 = mainSocket.of('/socketIO1'); // Создание пространства имен

    app.set('socketIO', socketIO1); // Устанавливаем io в объект приложения Express

    const userSocketMap = new Map();

    socketIO1.on('connection', (socket) => {
        const userId = socket.handshake.auth.userId; // Получаем userId из handshake
        socket.userId = userId; // Добавляем userId к объекту сокета
        userSocketMap.set(userId, socket);
    });
    socketIO1.on('disconnect', (socket) => {
        const userId = socket.userId; // Получаем userId из объекта сокета
        if (userId) {
            userSocketMap.delete(userId);
        }
    });

    app.set('userSocketMap', userSocketMap); // Сохраняем Map в объекте приложения Express

    return socketIO1
};

module.exports = {setupSocketOne}