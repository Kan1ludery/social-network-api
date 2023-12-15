const connect = require("../dbSafe/db");

async function createChat(participantIds, chatId) {
    try {
        const db = await connect();
        const chatsCollection = db.collection('chats');

        const existingChatWithDelete = await chatsCollection.findOne({
            chatId: chatId,
            participantsIdForDelete: { $exists: true },
        });

        if (existingChatWithDelete) {
            const participantsToAdd = existingChatWithDelete.participantsIdForDelete.split(',');
            await chatsCollection.updateOne(
                { chatId: chatId },
                {
                    $addToSet: {
                        participants: { $each: participantsToAdd }
                    },
                    $unset: { participantsIdForDelete: '' }
                }
            );
            return true
        }

        if (!participantIds || participantIds.length !== 2) {
            return false;
        }

        if (await chatsCollection.findOne({ chatId: chatId })) {
            return false;
        }

        const chat = {
            chatId: chatId,
            title: `Чат между пользователями ${participantIds[0]} и ${participantIds[1]}`,
            participants: participantIds,
            messages: [],
            lastMessage: null,
            created_at: new Date(),
            isPersonal: false,
        };

        const result = await chatsCollection.insertOne(chat);

        if (result) {
            return true
        }

    } catch (error) {
        console.error('Ошибка при создании чата:', error);
        return {error: 'Ошибка при создании чата'};
    }
}

module.exports = {createChat};
