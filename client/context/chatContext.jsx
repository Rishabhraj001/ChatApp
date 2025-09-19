import {  createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()

export const ChatProvider = ({children})=>{
    const [messages,setMessages]= useState([])
    const [users,setusers]= useState([])
    const [selectedUser,setselectedUser]=useState(null)
    const [unseenmessage,setunseenmessage]= useState({})

    const {socket,axios} = useContext(AuthContext)

    //get all users
    const getUsers = async ()=>{
        try{
          const {data}= await axios.get("/api/messages/users");
          if(data.success){
            setusers(data.users)
            setunseenmessage(data.unseenmessage)
          }
        }catch(error){
           toast.error(error.message)
        }
    }

    const getMessages = async (userId)=>{
        try{
           const {data}= await axios.get(`/api/messages/${userId}`);
           if(data.success){
            setMessages(data.messages)
           }
        }catch(err){
              toast.error(err.message)
        }
    }

    //function to send message to selected user
    const sendMessages = async(messageData)=>{
        try{
            const {data}= await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
           
            if(data.success){
                setMessages((prevMessage)=>[...prevMessage,data.message])
            }
        }catch(err){
              toast.error(err.message)
        }
    }

    //function to subscrib to new mess
    const subscribeNewMessages = async()=>{
        if(!socket){
            return;
        }

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessage)=>[...prevMessage,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setunseenmessage((preveUnseenmessages)=>({
                    ...preveUnseenmessages, [newMessage.senderId] :
                     (preveUnseenmessages?.[newMessage.senderId] || 0) + 1
                }))
            }
        })
    }

    //fun to unsubscribe 
    const unsubscribeFromMessages =()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
           subscribeNewMessages();
           return ()=> unsubscribeFromMessages()
    },[socket,setselectedUser,messages])
    const value = {
         getMessages, messages,users,selectedUser,getUsers,setMessages,sendMessages,setselectedUser,unseenmessage,setunseenmessage
    }
    return (
        <ChatContext.Provider value={value}>
          {children}
        </ChatContext.Provider>
    )
}