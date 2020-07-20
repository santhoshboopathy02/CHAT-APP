const users=[]

const addUser=({id,Username,Room}) =>{
    Username=Username.trim().toLowerCase()
    Room=Room.trim().toLowerCase()

    if(!Username|| !Room){
        return {
            error:'Username and room are required'
        }
    }

    const existingUser=users.find((user) =>{
        return user.Room === Room && user.Username === Username
    })

    if(existingUser){
        return {
            error:'Username is in use'
        }
    }

    const user={id,Username,Room}
    users.push(user)
    return{user}
}

const removeUser=(id) =>{
    const index=users.findIndex((user) =>{
        return user.id ===id
    })
    if(index!== -1){
        return users.splice(index,1)[0] 
    }
}

const getUser=(id) =>{

    return users.find((user) => user.id===id)
}

const getUsersInRoom=(Room)=>{
    return users.filter((user) =>user.Room ===Room)
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}