import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { 
  RxExit, 
  RxPencil2, 
  RxCross2,
  RxImage,
  RxPerson,
  RxPlus
} from "react-icons/rx";
import { FiMoreVertical, FiTrash2, FiUserX, FiUserPlus, FiEdit3 } from "react-icons/fi";
import { GrFormClose } from "react-icons/gr";
import { BsPencil } from "react-icons/bs";

import { ChatState } from "../context/ChatProvider";
import { getSender, getSenderProfilePic, getSenderFull } from "../config/ChatLogics";
import { getProfilePicUrl } from "../utils/profileUtils";

import UpdateGroupChat from "./Group/UpdateGroupChat";
import SubmitModal from "./Aux/SubmitModal";
import SingleChat from "./SingleChat";
import UserListItem from "./Aux/UserListItem";

import { toast } from "react-toastify";
import axios from "axios";
import { 
  removeGroupChatRoute, 
  deleteChatRoute, 
  blockChatRoute,
  updateWallpaperRoute,
  updateNicknameRoute,
  addGroupChatRoute,
  allUsersRoute,
  groupChatRoute
} from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";

// Wallpaper options
const wallpaperOptions = [
  { name: 'Default', value: '' },
  { name: 'Light Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)' },
];

function ChatContainer({ socket, fetchAgain, setFetchAgain }) {
  const { setSelectedChat, selectedChat, user, chats, setChats } = ChatState();
  const [showToggle, setShowToggle] = useState(false);
  const [modalUpdateActive, setModalUpdateActive] = useState("not");
  const [modalSubmitActive, setModalSubmitActive] = useState("not");
  const [warnText, setWarnText] = useState("");
  const [submText, setSubmText] = useState("");
  
  // New states for additional features
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [existingGroups, setExistingGroups] = useState([]);

  const updateChat = () => {
    setModalUpdateActive("active");
    setShowToggle(false);
  };

  const leaveChat = () => {
    setModalSubmitActive("leave");
    setShowToggle(false);
    setWarnText("You cannot return to this chat by yourself.");
    setSubmText(`Are you sure you want to leave ${selectedChat.chatName}?`);
  };

  const handleLeave = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.put(
        removeGroupChatRoute,
        { chatId: selectedChat._id, userId: user._id },
        config
      );
      setFetchAgain(!fetchAgain);
      toast.success(`You successfully left ${selectedChat.chatName}`, toastOptions);
      setSelectedChat();
      setModalSubmitActive("not");
    } catch (error) {
      toast.error("Something went wrong! Please, try again", toastOptions);
    }
  };

  // Delete Chat
  const deleteChat = () => {
    setModalSubmitActive("delete");
    setShowToggle(false);
    const chatName = selectedChat.isGroupChat 
      ? selectedChat.chatName 
      : getSender(user, selectedChat.users);
    setWarnText("You cannot restore this chat. All messages will be permanently deleted.");
    setSubmText(`Are you sure you want to delete chat with ${chatName}?`);
  };

  const handleDelete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(deleteChatRoute, { chatId: selectedChat._id }, config);
      setFetchAgain(!fetchAgain);
      toast.success(`Chat deleted successfully`, toastOptions);
      setSelectedChat();
      setModalSubmitActive("not");
    } catch (error) {
      toast.error("Something went wrong! Please, try again", toastOptions);
    }
  };

  // Block Chat
  const blockChat = () => {
    setModalSubmitActive("block");
    setShowToggle(false);
    const isBlocked = selectedChat.blockedBy?.includes(user._id);
    const chatName = selectedChat.isGroupChat 
      ? selectedChat.chatName 
      : getSender(user, selectedChat.users);
    setWarnText(isBlocked 
      ? "You will be able to receive messages from this chat again." 
      : "You will not receive messages from this chat.");
    setSubmText(isBlocked 
      ? `Are you sure you want to unblock ${chatName}?`
      : `Are you sure you want to block ${chatName}?`);
  };

  const handleBlock = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(blockChatRoute, { chatId: selectedChat._id }, config);
      setFetchAgain(!fetchAgain);
      toast.success(data.message, toastOptions);
      setSelectedChat(data.chat);
      setModalSubmitActive("not");
    } catch (error) {
      toast.error("Something went wrong! Please, try again", toastOptions);
    }
  };

  // Change Wallpaper
  const openWallpaperModal = () => {
    setShowWallpaperModal(true);
    setShowToggle(false);
  };

  const handleWallpaperChange = async (wallpaperValue) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(updateWallpaperRoute, { 
        chatId: selectedChat._id,
        wallpaper: wallpaperValue
      }, config);
      
      // Update the selected chat with new wallpaper data
      const updatedChat = data.chat;
      setSelectedChat(updatedChat);
      
      // Also update the chat in the chats array
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === updatedChat._id ? updatedChat : chat
        )
      );
      
      setFetchAgain(!fetchAgain);
      toast.success("Wallpaper updated!", toastOptions);
      setShowWallpaperModal(false);
    } catch (error) {
      toast.error("Something went wrong! Please, try again", toastOptions);
    }
  };

  // Change Nickname
  const openNicknameModal = () => {
    setShowNicknameModal(true);
    setShowToggle(false);
    // Get the other user's current nickname if exists
    if (!selectedChat.isGroupChat) {
      const otherUser = getSenderFull(user, selectedChat.users);
      const nicknameKey = `${user._id}_${otherUser._id}`;
      const existingNickname = selectedChat.nicknames?.get?.(nicknameKey) || 
                               (selectedChat.nicknames && selectedChat.nicknames[nicknameKey]) || "";
      setNewNickname(existingNickname);
    }
  };

  const handleNicknameUpdate = async () => {
    if (!selectedChat.isGroupChat) {
      const otherUser = getSenderFull(user, selectedChat.users);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.put(updateNicknameRoute, { 
          chatId: selectedChat._id,
          targetUserId: otherUser._id,
          nickname: newNickname
        }, config);
        setSelectedChat(data.chat);
        setFetchAgain(!fetchAgain);
        toast.success("Nickname updated!", toastOptions);
        setShowNicknameModal(false);
        setNewNickname("");
      } catch (error) {
        toast.error("Something went wrong! Please, try again", toastOptions);
      }
    }
  };

  // Add to Group
  const openAddToGroupModal = async () => {
    setShowAddToGroupModal(true);
    setShowToggle(false);
    setIsCreatingNewGroup(false);
    
    // Get existing groups where current user is admin
    const userGroups = chats.filter(chat => 
      chat.isGroupChat && 
      chat.groupAdmin?._id === user._id
    );
    setExistingGroups(userGroups);
  };

  const searchUsersForGroup = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchUsers([]);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${allUsersRoute}?search=${query}`, config);
      setSearchUsers(data);
    } catch (error) {
      toast.error("Failed to search users", toastOptions);
    }
  };

  const addUserToExistingGroup = async (groupId) => {
    if (!selectedChat.isGroupChat) {
      const otherUser = getSenderFull(user, selectedChat.users);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(addGroupChatRoute, { 
          chatId: groupId,
          userId: otherUser._id
        }, config);
        setFetchAgain(!fetchAgain);
        toast.success("User added to group!", toastOptions);
        setShowAddToGroupModal(false);
      } catch (error) {
        toast.error("Failed to add user to group", toastOptions);
      }
    }
  };

  const createNewGroupWithUser = async () => {
    if (!newGroupName.trim()) {
      toast.warning("Please enter a group name", toastOptions);
      return;
    }
    
    const otherUser = selectedChat.isGroupChat ? null : getSenderFull(user, selectedChat.users);
    const usersToAdd = otherUser ? [otherUser._id, ...selectedUsersForGroup.map(u => u._id)] : selectedUsersForGroup.map(u => u._id);
    
    if (usersToAdd.length < 1) {
      toast.warning("Add at least one user to create a group", toastOptions);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(groupChatRoute, {
        name: newGroupName,
        users: JSON.stringify(usersToAdd)
      }, config);
      setChats([data, ...chats]);
      setFetchAgain(!fetchAgain);
      toast.success("New group created!", toastOptions);
      setShowAddToGroupModal(false);
      setNewGroupName("");
      setSelectedUsersForGroup([]);
    } catch (error) {
      toast.error("Failed to create group", toastOptions);
    }
  };

  // Get current wallpaper for this chat
  const getCurrentWallpaper = () => {
    if (!selectedChat || !selectedChat.wallpapers) {
      return '';
    }
    
    const userId = user._id.toString();
    
    // Handle both Map and plain object from server
    if (selectedChat.wallpapers instanceof Map) {
      return selectedChat.wallpapers.get(userId) || '';
    }
    
    // Plain object from JSON response
    return selectedChat.wallpapers[userId] || '';
  };

  // Get display name (nickname or actual name)
  const getDisplayName = () => {
    if (selectedChat.isGroupChat) {
      return selectedChat.chatName;
    }
    const otherUser = getSenderFull(user, selectedChat.users);
    const nicknameKey = `${user._id}_${otherUser._id}`;
    const nickname = selectedChat.nicknames?.get?.(nicknameKey) || 
                    (selectedChat.nicknames && selectedChat.nicknames[nicknameKey]);
    return nickname || getSender(user, selectedChat.users);
  };

  const isBlocked = selectedChat?.blockedBy?.includes(user._id);

  return (
    <div className="right-side">
      <div className="chat-header">
        <button className="back-button" onClick={() => setSelectedChat(undefined)}>
          <IoIosArrowBack />
        </button>

        {selectedChat && (
          <div className="user-details">
            <div className="avatar">
              <img
                src={selectedChat.isGroupChat
                  ? process.env.REACT_APP_PROFILE_PICS_PATHS + selectedChat.groupPic
                  : getProfilePicUrl(getSenderProfilePic(user, selectedChat.users), selectedChat.users[0]._id === user._id ? selectedChat.users[1]?.gender : selectedChat.users[0]?.gender)}
                alt={getDisplayName()}
              />
            </div>
            <div className="username">
              <h3>{getDisplayName()}</h3>
              {isBlocked && <span className="blocked-badge">Blocked</span>}
            </div>
          </div>
        )}

        <div className="chat-menu">
          <button
            className={`menu-button ${showToggle ? "active" : ""}`}
            onClick={() => setShowToggle(!showToggle)}
          >
            <FiMoreVertical />
          </button>
          
          {showToggle && (
            <div className="chat-menu-dropdown">
              <button className="list-item" onClick={deleteChat}>
                <FiTrash2 />
                <span>Delete Chat</span>
              </button>
              
              <button className="list-item" onClick={blockChat}>
                <FiUserX />
                <span>{isBlocked ? "Unblock Chat" : "Block Chat"}</span>
              </button>
              
              <button className="list-item" onClick={openWallpaperModal}>
                <RxImage />
                <span>Change Wallpaper</span>
              </button>
              
              {!selectedChat?.isGroupChat && (
                <button className="list-item" onClick={openNicknameModal}>
                  <FiEdit3 />
                  <span>Change Nickname</span>
                </button>
              )}
              
              {!selectedChat?.isGroupChat && (
                <button className="list-item" onClick={openAddToGroupModal}>
                  <FiUserPlus />
                  <span>Add to Group</span>
                </button>
              )}

              {selectedChat?.isGroupChat && (
                <>
                  <button className="list-item" onClick={updateChat}>
                    <RxPencil2 />
                    <span>Edit Group</span>
                  </button>
                  <button className="list-item" onClick={leaveChat}>
                    <RxExit />
                    <span>Leave Group</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <SingleChat
        fetchAgain={fetchAgain}
        socket={socket}
        setFetchAgain={setFetchAgain}
        selectedChat={selectedChat}
        wallpaper={getCurrentWallpaper()}
      />

      {/* Update Group Modal */}
      {modalUpdateActive === "active" && (
        <UpdateGroupChat
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          setModalActive={setModalUpdateActive}
        />
      )}

      {/* Leave Group Modal */}
      {modalSubmitActive === "leave" && (
        <SubmitModal
          setModalActive={setModalSubmitActive}
          warnText={warnText}
          submText={submText}
          handleFunction={handleLeave}
        />
      )}

      {/* Delete Chat Modal */}
      {modalSubmitActive === "delete" && (
        <SubmitModal
          setModalActive={setModalSubmitActive}
          warnText={warnText}
          submText={submText}
          handleFunction={handleDelete}
        />
      )}

      {/* Block Chat Modal */}
      {modalSubmitActive === "block" && (
        <SubmitModal
          setModalActive={setModalSubmitActive}
          warnText={warnText}
          submText={submText}
          handleFunction={handleBlock}
        />
      )}

      {/* Wallpaper Modal */}
      {showWallpaperModal && (
        <div className="modal-wrapper">
          <div className="modal-container wallpaper-modal">
            <div className="close-button-wrapper">
              <button className="close-button" onClick={() => setShowWallpaperModal(false)}>
                <GrFormClose />
              </button>
            </div>
            <div className="modal-header">
              <h2>Choose Wallpaper</h2>
            </div>
            <div className="wallpaper-options">
              {wallpaperOptions.map((wp, index) => (
                <div 
                  key={index}
                  className={`wallpaper-option ${getCurrentWallpaper() === wp.value ? 'selected' : ''}`}
                  style={{ background: wp.value || '#f0f4ff' }}
                  onClick={() => handleWallpaperChange(wp.value)}
                >
                  <span>{wp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="modal-wrapper">
          <div className="modal-container nickname-modal">
            <div className="close-button-wrapper">
              <button className="close-button" onClick={() => setShowNicknameModal(false)}>
                <GrFormClose />
              </button>
            </div>
            <div className="modal-header">
              <h2>Set Nickname</h2>
              <p>Set a nickname for {getSender(user, selectedChat.users)}</p>
            </div>
            <div className="modal-content">
              <div className="modal-input">
                <input
                  type="text"
                  placeholder="Enter nickname..."
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
                <BsPencil />
              </div>
              <div className="button-submit">
                <button className="button" onClick={handleNicknameUpdate}>
                  Save Nickname
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Group Modal */}
      {showAddToGroupModal && (
        <div className="modal-wrapper">
          <div className="modal-container add-to-group-modal">
            <div className="close-button-wrapper">
              <button className="close-button" onClick={() => {
                setShowAddToGroupModal(false);
                setIsCreatingNewGroup(false);
                setNewGroupName("");
                setSelectedUsersForGroup([]);
              }}>
                <GrFormClose />
              </button>
            </div>
            <div className="modal-header">
              <h2>{isCreatingNewGroup ? "Create New Group" : "Add to Group"}</h2>
            </div>
            <div className="modal-content">
              {!isCreatingNewGroup ? (
                <>
                  <button 
                    className="create-new-group-btn"
                    onClick={() => setIsCreatingNewGroup(true)}
                  >
                    <RxPlus /> Create New Group
                  </button>
                  
                  {existingGroups.length > 0 && (
                    <>
                      <h4>Or add to existing group:</h4>
                      <div className="existing-groups">
                        {existingGroups.map(group => (
                          <div 
                            key={group._id} 
                            className="group-item"
                            onClick={() => addUserToExistingGroup(group._id)}
                          >
                            <img 
                              src={process.env.REACT_APP_PROFILE_PICS_PATHS + group.groupPic}
                              alt={group.chatName}
                            />
                            <span>{group.chatName}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="modal-input">
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <BsPencil />
                  </div>
                  
                  <div className="modal-input">
                    <input
                      type="text"
                      placeholder="Search users to add..."
                      value={searchQuery}
                      onChange={(e) => searchUsersForGroup(e.target.value)}
                    />
                    <RxPerson />
                  </div>

                  {selectedUsersForGroup.length > 0 && (
                    <div className="selected-users">
                      {selectedUsersForGroup.map(u => (
                        <span key={u._id} className="user-badge">
                          {u.username}
                          <RxCross2 onClick={() => setSelectedUsersForGroup(
                            selectedUsersForGroup.filter(su => su._id !== u._id)
                          )} />
                        </span>
                      ))}
                    </div>
                  )}

                  {searchUsers.length > 0 && (
                    <div className="search-results">
                      {searchUsers.slice(0, 4).map(u => (
                        <UserListItem 
                          key={u._id}
                          result={u}
                          handleFunction={() => {
                            if (!selectedUsersForGroup.find(su => su._id === u._id)) {
                              setSelectedUsersForGroup([...selectedUsersForGroup, u]);
                            }
                            setSearchQuery("");
                            setSearchUsers([]);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="button-submit">
                    <button className="button" onClick={createNewGroupWithUser}>
                      Create Group
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatContainer;
