const express=require("express");
const app=express();
const http=require("http");
const path=require("path");
const socketio=require("socket.io");
const Filter=require("bad-words");
const { generateMessage }=require("./utlils/generateMessage");
const { addUser , removeUser , getUser , getUserInRoom}=require("./utlils/users");

const server=http.createServer(app);
const io=socketio(server);

app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    console.log(res);
    res.sendFile(path.join(__dirname,"/public","/index.html"));
})

io.on("connection",(socket)=>{
    const filter=new Filter();
    console.log("New connection imported");
    socket.on("join",({username , room},callback)=>{
        const { error , user } = addUser({id:socket.id, username,room});
        if(error){
            return callback(error);
        } 
        socket.join(user.room);
       
        socket.emit("message",generateMessage("Welcome",`Admin:${user.username}`));
        socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} has joined`,"Admin"));
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback();
        //socket.emit socket.on io.emit socket.broadcast.emit
        //socket.to.emit , socket.broadcast.to.emit
    })
    socket.on("send_message",({message},callback)=>{
        if(filter.isProfane(message)){
            return callback("Profanity not allowed");
        }
        const user=getUser(socket.id);
        socket.emit("message",generateMessage(message,"Admin"));
        socket.broadcast.to(user.room).emit("message",generateMessage(message,user.username));
        callback();
    })
    socket.on("disconnect",()=>{
        const user=removeUser(socket.id);

        if(user){
          io.to(user.room).emit("message",generateMessage(`${user.username} has left`,"Admin"));
          io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        }
    })
    socket.on("send-location",(coords,callback)=>{
        const user=getUser(socket.id);
        socket.emit("location-message",generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`,"Admin"));
        socket.broadcast.to(user.room).emit("location-message",generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`,user.username));
        callback("You are traced");
    })
})

// let count=0;

// io.on("connection",(socket)=>{
//     console.log("New web socket connection");
//     socket.emit("count_updated",count);
//     socket.on("count_increment",()=>{
//        count=count+1;
//        io.emit("count_updated",count);
//     });
// })

const port=process.env.PORT||8080;
server.listen(port,()=>{
    console.log(`Port running on ${port}`);
})