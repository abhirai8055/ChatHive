const express = require("express");
const app = express();
const cors= require('cors');
const io = require('socket.io')(8585,{
    cors:{
        origin:'http://localhost:3002'
    }
})

const port =9000;

const userRouter = require("./routing/userRouter");
require("./dbconnection/dbconfig");


 

app.use('/user', userRouter);
app.use(express.json())
app.use(cors())

io.on('connection', socket => {

    console.log('User connected', socket.id);
    
    // socket.on('addUser', userId => {
    
    // socket.userId = userId;
    
    // });
    
    // io.emit('getUsers', socket.userId);
    
    });






app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});








