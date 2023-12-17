const connect = require("../controllers/dbSafe/db");


const saveMessageToDatabase = async (chatId, message) => {
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
            console.log('Сообщение сохранено в базе данных');
        } else {
            console.error('Ошибка при сохранении сообщения в базе данных');
        }
    } catch (error) {
        console.error('Ошибка при обновлении базы данных:', error);
    }
};
module.exports = {saveMessageToDatabase};