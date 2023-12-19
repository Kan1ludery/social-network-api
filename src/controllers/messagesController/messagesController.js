// messagesRoutes.js
const refreshTokenController = require("../dbSafe/refreshTokenController");
const csrfTokenController = require("../dbSafe/csrfTokenController");
const usersController = require("../userController/getRandomUsers");
const friendsSearch = require("./friendsSearch");
const setupAddFriendRequest = require("./addFriendRequest");
const getFriendsChat = require("./getFriendsChatList");
const getFriendsRequests = require("./getFriendsRequests");
const setupAcceptFriendRequest = require("./acceptFriendRequest");
const rejectFriendRequests = require("./rejectFriendRequest");
const getChatInfo = require("./getChatInfo");
const deleteChat = require("./deleteChat");
const deleteFriendship = require("./deleteFriendship")
const myDeletedChats = require("./myDeletedChats")
const restoreAccessToChat = require("./restoreAccessToChat")
const setupMessagesRoutes = (app) => {
    app.use('/api', refreshTokenController); // /api/refresh-token (замена старого jwt-токена)
    app.use('/api', csrfTokenController)     // /api/getCsrfToken (получение csrfToken)
    app.use('/api', usersController)         // /api/users (получение пользователей)
    app.use('/api', friendsSearch) // /api/friends-search (Поиск потенциальных пользователей)
    app.use('/api', setupAddFriendRequest(app)) // /api/addFriend (Запрос на добавление в друзья)
    app.use('/api', getFriendsChat) // /api/getFriends (Получение списка друзей)
    app.use('/api', getFriendsRequests) // /api/getFriendsRequests (Получение реквестов от других пользователей)
    app.use('/api', setupAcceptFriendRequest(app)) // /api/acceptFriendRequest (Добавление в друзья)
    app.use('/api', rejectFriendRequests) // /api/rejectFriendRequests (Удаление из друзей (заявка))
    app.use('/api', deleteFriendship) // /api/deleteFriendship (Удаление из друзей)
    app.use('/api', getChatInfo) // /api/getChatInfo/:chatId (Получение информации чата)
    app.use('/api', deleteChat) // /api/deleteChat (Удаление чата пользователю)
    app.use('/api', myDeletedChats) // /api/myDeletedChats (Вывод списка чатов, которые пользователь удалил)
    app.use('/api', restoreAccessToChat) // /api/restoreAccessToChat (Вывод списка чатов, которые пользователь удалил)
};

module.exports = {setupMessagesRoutes};
