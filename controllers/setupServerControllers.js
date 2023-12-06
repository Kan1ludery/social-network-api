const {setupAuthRoutes} = require("./authController/authController");
const {setupMessagesRoutes} = require("./messagesController/messagesController");
const {setupUserRoutes} = require("./userController/userController");
const setupServerControllers = (app) => {
    setupAuthRoutes(app)
    setupMessagesRoutes(app)
    setupUserRoutes(app)
}

module.exports = {setupServerControllers}