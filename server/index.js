const express = require("express");
const app = express();
const cors = require('cors');
const io = require('socket.io')(8585, {
    cors: {
        origin: 'http://localhost:3002'
    }
})

const port = 9000;

const userRouter = require("./routing/userRouter");
const userController = require("./controller/userController");
require("./dbconnection/dbconfig");




app.use('/user', userRouter);
app.use(express.json());
app.use(cors())

let users = [];

io.on('connection', socket => {

    console.log('User connected', socket.id);

    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = {
                userId,
                socketId: socket.id
            };
            users.push(user);
            io.emit('getUsers', users);
        }
    });



    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId, receiverId);
        const sender = users.find(user => user.userId == senderId);
        const user = await userController.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);

    });

    // io.emit('getUsers', socket.userId);

});






app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});








