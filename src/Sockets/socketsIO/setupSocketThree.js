// setupSocketThree.js
const {saveMessageToDatabase} = require("../../utils/saveMessageToDatabase");
const {createChat} = require("../../controllers/messagesController/createChat");

const chatRooms = {};
const userSockets = new Map();

const addUserSocket = (userId, socket) => {
    userSockets.set(userId, socket);
};

const getUserSocket = (userId) => {
    return userSockets.get(userId);
};

const removeUserSocket = (userId) => {
    userSockets.delete(userId);
};

const createChatRoom = (client, chatId) => {
    if (!chatRooms[chatId]) {
        chatRooms[chatId] = [];
    }
    if (!chatRooms[chatId].includes(client)) {
        chatRooms[chatId].push(client);
    }
};

const broadcastMessage = (chatId, senderId, text) => {
    if (chatRooms[chatId]) {
        chatRooms[chatId].forEach(client => {
            client.emit('chatMessage', { chatId, senderId, text, timestamp: new Date() });
        });
    }
};

const broadcastChatCreated = (senderId, targetId, chatId) => {
    const senderSocket = getUserSocket(senderId);
    const targetSocket = getUserSocket(targetId);

    createChatRoom(senderSocket, chatId);
    createChatRoom(targetSocket, chatId);

    chatRooms[chatId].forEach(socket => {
        socket.emit('chatCreated', { chatId });
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

const setupSocketThree = (mainSocket) => {
    const socketIO3 = mainSocket.of('/socketIO3'); // Создание пространства имен для третьего сокета

    socketIO3.on('connection', (socket) => {
        const { chatIds, userId } = socket.handshake.auth;
        if (chatIds.length === 0) {
            socket.emit('error', 'No chatId provided');
            socket.disconnect();
            return;
        }

        addUserSocket(userId, socket);

        chatIds.forEach(chatId => createChatRoom(socket, chatId));

        socket.on('message', async (messageData) => {
            try {
                const { chatId, senderId, message, targetId } = messageData;
                if (senderId && chatId && message) {
                    const chatCreationResult = await createChat([senderId, targetId], chatId);
                    if (chatCreationResult) {
                        broadcastChatCreated(senderId, targetId, chatId);
                    }

                    await saveMessageToDatabase(chatId, { senderId, text: message, timestamp: new Date() });

                    broadcastMessage(chatId, senderId, message);
                } else {
                    console.error('Invalid message from client:', message);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        socket.on('disconnect', () => {
            chatIds.forEach(chatId => removeClientFromChat(chatId, socket));
            removeUserSocket(userId);
        });
    });

    socketIO3.on('disconnect', () => {
        console.log('disconnected3');
    });

    return socketIO3;
};

module.exports = { setupSocketThree };
