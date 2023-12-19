const socketIo = require('socket.io');
const {setupSocketOne} = require("./socketsIO/setupSocketOne");
const {setupSocketTwo} = require("./socketsIO/setupSocketTwo");
const {setupSocketThree} = require("./socketsIO/setupSocketThree")
const setupWebSocketIO = (app, server) => {

    /** Main server for IO sockets */
    const mainSocket = socketIo(server, {
        cors: {
            origin: ['https://social-network-1udsck7b7-kans-projects-f163426e.vercel.app', 'http://localhost:3000', 'https://social-network-theta-seven.vercel.app'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    /** REQUEST FRIENDS AND EMAIL SOCKET*/
    const {io1} = setupSocketOne(app, mainSocket)

    /** ONLINE WEBSOCKET */
    const {io2} = setupSocketTwo(mainSocket)

    /** MESSAGES SOCKET */
    const {io3} = setupSocketThree(mainSocket)

    return {io1, io2, io3}; // Prob return
};

module.exports = {setupWebSocketIO};
