// setupSocketTwo.js
const socketIo = require('socket.io');
const setupSocketTwo = (app, server) => {
    const io2 = socketIo(server, {
        cors: {
            origin: ['https://social-network-1udsck7b7-kans-projects-f163426e.vercel.app', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io2.on('connection', (socket) => {

    });
    io2.on('disconnect', (socket) => {

    });

    return io2
};

module.exports = {setupSocketTwo}