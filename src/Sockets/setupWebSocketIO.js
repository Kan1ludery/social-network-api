const socketIo = require('socket.io');
const https = require("https");
const {setupSocketOne} = require("./socketsIO/setupSocketOne");
const {setupSocketTwo} = require("./socketsIO/setupSocketTwo");

const setupWebSocketIO = (app, server) => {

    const {io1} = setupSocketOne(app, server)
    const {io2} = setupSocketTwo(app, server)

    return {io1, io2};
};

module.exports = {setupWebSocketIO};
