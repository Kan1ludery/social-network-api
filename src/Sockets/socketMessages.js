// socketMessages.js
const WebSocket = require('ws');
const {saveMessageToDatabase} = require("../utils/saveMessageToDatabase");
const {createChat} = require("../controllers/messagesController/createChat");
const {Server} = WebSocket

const chatRooms = {};
const userSockets = new Map(); // Создаем мапу для хранения сокетов пользователей
const addUserSocket = (userId, socket) => {
    userSockets.set(userId, socket); // Сохраняем сокет пользователя
};
// Получение сокета по userId
const getUserSocket = (userId) => {
    return userSockets.get(userId); // Получаем сокет пользователя по его userId
};

// Удаление сокета при отключении пользователя
const removeUserSocket = (userId) => {
    userSockets.delete(userId); // Удаляем сокет пользователя по его userId
};

const createChatRoom = (client, chatId) => {
    if (!chatRooms[chatId]) {
        chatRooms[chatId] = [];
    }
    if (!chatRooms[chatId].includes(client)) {
        chatRooms[chatId].push(client);
    }
};
// Функция для рассылки сообщения только участникам чата
const broadcastMessage = (chatId, senderId, text) => {
    if (chatRooms[chatId]) {
        chatRooms[chatId].forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                const messageData = JSON.stringify({type: 'chatMessage', chatId, senderId, text, timestamp: new Date()});
                client.send(messageData);
            }
        });
    }
};
const broadcastChatCreated = (senderId, targetId, chatId) => {
    const senderSocket = getUserSocket(senderId);
    const targetSocket = getUserSocket(targetId);

    const chatCreatedMessage = JSON.stringify({ type: 'chatCreated', chatId: chatId });

    createChatRoom(senderSocket, chatId); // Добавляем сокет отправителя в комнату чата
    createChatRoom(targetSocket, chatId); // Добавляем сокет получателя в комнату чата
    chatRooms[chatId].forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(chatCreatedMessage);
        }
    });
};


const removeClientFromChat = (chatId, client) => {
    if (chatRooms[chatId]) {
        const index = chatRooms[chatId].indexOf(client);
        if (index !== -1) {
            chatRooms[chatId].splice(index, 1);
        }
    }
};

const setupWebSocketMessages = (server) => {
    const wssMessages = new Server({server});
    // Обработчик подключения клиентов
    wssMessages.on('connection', (wsMsg, request) => {
        // Извлекаем chatId из URL
        const chatIds = request.url.split('/').filter(part => part !== ''); // Разбиваем URL на части
        const userId = chatIds.pop();
        if (chatIds.length === 0) {
            // Отправляем сообщение об ошибке и закрываем соединение
            wsMsg.send('Ошибка: Не указаны chatId');
            wsMsg.close();
            return;
        }
        // Добавляем сокет пользователя к его userId
        addUserSocket(userId, wsMsg);
        // Создаем комнаты для каждого chatId
        chatIds.forEach(chatId => createChatRoom(wsMsg, chatId));
        wsMsg.on('message', async (messageData) => {
            try {
                const data = JSON.parse(messageData);
                const {chatId, senderId, message, targetId} = data;
                if (senderId && chatId && message) {
                    // Создание чата если он отсуствует
                    const chatCreationResult = await createChat([senderId, targetId], chatId)
                    if (chatCreationResult) {
                        // Отправить сообщение об успешном создании чата для обоих участников в этой комнате
                        broadcastChatCreated(senderId, targetId, chatId);
                    }

                    // Сохранение в базу данных
                    await saveMessageToDatabase(chatId, {senderId: senderId, text: message, timestamp: new Date()});

                    // Отправка сообщения только участникам этого чата
                    broadcastMessage(chatId, senderId, message);
                } else {
                    console.error('Получено неверное сообщение от клиента:', message);
                }
            } catch (error) {
                console.error('Ошибка при обработке сообщения:', error);
            }
        });
        // Обработчик закрытия соединения
        wsMsg.on('close', () => {
            chatIds.forEach(chatId => removeClientFromChat(chatId, wsMsg));
            removeUserSocket(userId);
        });
    });
};
module.exports = {setupWebSocketMessages};