const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port =process.env.PORT || 3000
const publicPath=path.join(__dirname, '../public')

app.use(express.static(publicPath)) /

io.on('connection', (socket)=>{
    console.log('New websocket connection')

    
    socket.on('join',({Username,Room},callback) =>{
        const {error,user}=addUser({id:socket.id,Username,Room})
        if(error){
            return callback(error)
        }

        socket.join(user.Room)

        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.Room).emit('message',generateMessage('Admin',`${user.Username} has joined`))
        io.to(user.Room).emit('roomData',{
            Room:user.Room,
            users:getUsersInRoom(user.Room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback) =>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }

        io.to(user.Room).emit('message',generateMessage(user.Username,message))
        callback()

    })

    socket.on('sendLocation',(coords,callback) =>{
        const user=getUser(socket.id)
        io.to(user.Room).emit('locationMessage',generateLocationMessage(user.Username,'https://google.com/maps?q='+ coords.latitude +','+ coords.longitude))
        callback()
    })

    socket.on('disconnect',() =>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.Room).emit('message',generateMessage('Admin',`${user.Username} has left!!`))
            io.to(user.Room).emit('roomData',{
                Room:user.Room,
                users:getUsersInRoom(user.Room)
            })
        }

        
    })

})

server.listen(port, () => {
    console.log('Server is up and running !')
})