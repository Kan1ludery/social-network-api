const socketIo = require('socket.io');
const { verify } = require('jsonwebtoken');
const {loadEnv} = require("../../utils/loadEnv");
loadEnv();
const secretKey = process.env.SECRET_KEY;

const onlineUsers = new Map();

function broadcastOnlineUsers(io) {
    const onlineUserIds = Array.from(onlineUsers.keys());
    io.emit('onlineUsers', onlineUserIds);
}

const setupSocketTwo = (mainSocket) => {
    const socketIO2 = mainSocket.of('/socketIO2');

    socketIO2.on('connection', (socket) => {
        socket.on('socketStatus', (data) => {
            const { token } = data;
            if (!token) {
                socket.disconnect(true);
                return;
            }
            try {
                const decoded = verify(token, secretKey);
                const userId = decoded.userId;

                socket.userId = userId;
                onlineUsers.set(userId, 'online');
                broadcastOnlineUsers(socketIO2);
            } catch (error) {
                console.error('JWT verification failed:', error);
                socket.disconnect(true);
            }
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                broadcastOnlineUsers(socketIO2);
            }
        });
    });

    return socketIO2;
};

module.exports = { setupSocketTwo };
