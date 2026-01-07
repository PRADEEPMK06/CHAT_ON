import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [chts, setChts] = useState();
  const [profilePicVersion, setProfilePicVersion] = useState(Date.now()); // Cache buster for profile pics

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    setUser(userInfo);

    if (!userInfo) navigate("/auth");
  }, [navigate]);

  // Function to update user and trigger profile pic cache bust
  const updateUser = (newUser) => {
    setUser(newUser);
    setProfilePicVersion(Date.now()); // Force re-render of profile pics
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser: updateUser, // Use the wrapper function
        notification,
        setNotification,
        chats,
        setChats,
        chts, 
        setChts,
        profilePicVersion,
        setProfilePicVersion,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;