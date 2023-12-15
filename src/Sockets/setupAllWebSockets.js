const { setupWebSocketIO } = require("./setupWebSocketIO");
const { setupWebSocketMessages } = require("./socketMessages");
const { setupWebSocketOnlineStatus } = require("./socketOnlineStatus;");

const setupAllWebSockets = (app) => {
    const { server } = setupWebSocketIO(app);

    const serverMsg = app.listen(8080);
    setupWebSocketMessages(serverMsg);

    const serverOnl = app.listen(8081);
    setupWebSocketOnlineStatus(serverOnl);

    return { server };
};

module.exports = setupAllWebSockets;
