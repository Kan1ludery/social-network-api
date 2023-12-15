const WebSocket = require('ws');
require('dotenv').config();
const {Server} = WebSocket;
const {verify} = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

// Словарь для отслеживания статуса онлайн пользователей
const onlineUsers = new Map();
// Функция для отправки информации об онлайн пользователях всем клиентам
function broadcastOnlineUsers(wss) {
    const onlineUserIds = Array.from(onlineUsers.keys());
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'onlineUsers', data: onlineUserIds }));
        }
    });
}
const setupWebSocketOnlineStatus = (server) => {
    const wss = new Server({server});
    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'socketStatus') {
                const token = parsedMessage.token;
                if (!token) {
                    ws.close();
                    return;
                }
                try {
                    const decoded = verify(token, secretKey);
                    const userId = decoded.userId;

                    // Сохраняем userId в объекте сокета
                    ws.userId = userId;

                    // Устанавливаем статус "online" для пользователя
                    onlineUsers.set(userId, 'online');
                    broadcastOnlineUsers(wss)
                } catch (error) {
                    console.error('JWT verification failed:', error);
                    ws.close();
                }
            }
        });

        ws.on('close', () => {
            if (ws.userId) {

                // Удаляем пользователя из списка онлайн при закрытии
                onlineUsers.delete(ws.userId);

                // Отправляем информацию об онлайн пользователях всем клиентам
                broadcastOnlineUsers(wss);
            }
        });
    });
};

module.exports = {setupWebSocketOnlineStatus};
