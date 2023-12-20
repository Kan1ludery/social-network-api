const connect = require("../controllers/dbSafe/db");


const saveMessageToDatabase = async (chatId, message, socket) => {
    try {
        const db = await connect();
        const chatsCollection = db.collection('chats');

        // Проверяем, что чат с указанным chatId существует
        const chat = await chatsCollection.findOne({ chatId });

        // Создаем объект сообщения
        const messageData = {
            senderId: message.senderId, // Используем senderId из сообщения
            text: message.text,
            timestamp: message.timestamp,
        };

        if (messageData.text.length > 150) {
            throw new Error('Слишком длинное сообщение')
        }

        if (!chat) {
            console.error('Чат не найден');
            return;
        }

        // Обновляем базу данных для чата
        const result = await chatsCollection.updateOne(
            { chatId: chatId },
            {
                $push: { messages: { $each: [messageData], $position: 0 } },
                $set: {
                    lastMessage: messageData,
                },
            }
        );
        if (result.modifiedCount === 1) {

        } else {
            console.error('Ошибка при сохранении сообщения в базе данных');
        }
    } catch (error) {
        console.error('Ошибка при обновлении базы данных:', error);
        socket.emit('error', error.message);
        throw new Error('Error with saving message')
    }
};
module.exports = {saveMessageToDatabase};