const users=[];

const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();
    
    //clean the data
    if(!username || !room){
        return {
            error:"Credentials are invalid . Username and room is required"
        }
    }

    //validate the data
    const existingUser=users.find(user=>{
        return user.username===username && user.room===room;
    })

    if(existingUser){
        return{
            error: "Credentials are invalid.User already exists"
        }
    }

    //save user
    const user={id,username,room};
    users.push(user);
    return {user}
}

const removeUser=(id)=>{
    const index=users.findIndex(user=>user.id===id);
    if(index!==-1)
       return users.splice(index,1)[0];
}

//getUser
const getUser=(id)=>{
    const ourUser=users.find(user=>{
         return user.id===id;
    })
    if(!ourUser){
        return{
            error:"User you are trying to reach is not available"
        }
    }
    return ourUser;
}
//getUserInRoom
const getUserInRoom=(room)=>{
    room=room.trim().toLowerCase();
    const userInRoom=users.filter(user=>{
         return user.room===room;
    })
    if(!userInRoom){
        return{
            error:"User you are trying to reach is not available"
        }
    }
    return userInRoom;
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
