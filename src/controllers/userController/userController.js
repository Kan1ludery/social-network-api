// userRoutes.js
const getFriends = require("./getFriends");
const getProfile = require("./getProfile");
const getProfileImage = require("./getProfileImage");
const getRandomUsers = require("./getRandomUsers");
const profile = require("./profile");
const updateProfileDescription = require("./updateProfileDescription");
const updateSocialLinks = require("./updateSocialLinks");
const updateStates = require("./updateStates");
const uploadImage = require("./uploadImage");
const setupUserRoutes = (app) => {
    app.use('/api', getFriends) // /api/friends (Запрос на получение друзей)
    app.use('/api', getProfile) // /api/profile (Получение информации о пользователе)
    app.use('/api', getProfileImage) // /api/getProfileImage (Получение аватара пользователя)
    app.use('/api', getRandomUsers) // /api/getRandomUsers (Получение рандомных пользователей)
    app.use('/api', profile) // /api/profile (Получение информации о пользователе)
    app.use('/api', updateProfileDescription) // /api/updateProfileDescription (Обновляет описание профиля)
    app.use('/api', updateSocialLinks) // /api/updateSocialLinks (Обновляет социальные ссылки)
    app.use('/api', updateStates) // /api/updateStates (Получение/обновление состояний пользователя)
    app.use('/api', uploadImage) // /api/updateStates (Загрузка аватара пользователя)
}

module.exports = {setupUserRoutes}