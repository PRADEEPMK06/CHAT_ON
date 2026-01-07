import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import { RxPencil2, RxUpload } from "react-icons/rx";
import { BsTrash } from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";

import { ChatState } from "../context/ChatProvider";
import { deleteUserRoute, profilePicUpdateRoute } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import { getProfilePicUrl } from "../utils/profileUtils";
import UpdateProfile from "./UpdateProfile";
import SubmitModal from "./Aux/SubmitModal";
import CreateGroupChat from "./Group/CreateGroupChat";


function UserInfo({ fetchAgain, setFetchAgain }) {
    const { user, setUser, profilePicVersion } = ChatState();
    const navigate = useNavigate();
    const [modalUpdateActive, setModalUpdateActive] = useState("not");
    const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
    //submit hooks
    const [deleteActive, setDeleteActive] = useState("not");
    const [warnText, setWarnText] = useState("");
    const [submText, setSubmText] = useState("");

    const handleLocalStorage = (data) => {
        if (data.status === true) {
            localStorage.setItem(
                process.env.REACT_APP_LOCALHOST_KEY,
                JSON.stringify(data.updatedUser)
            );
        }
    };

    const handleLogout = async () => {
        localStorage.clear();
        navigate("/auth");
    };

    const imageUpload = async (event) => {
        event.preventDefault();
        const profilePic = event.target.files[0];
        const formData = new FormData();
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        };
        try {
            formData.append("userId", user._id);
            if (profilePic) formData.append("profilePic", profilePic, profilePic.name);
            const { data } = await axios.put(
                `${profilePicUpdateRoute}`,
                formData,
                config
            );
            setUser(data.updatedUser);
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);
            setShowProfilePicOptions(false);
            toast.success("Profile picture updated!", toastOptions);
        } catch (error) {
            toast.error("Something went wrong", toastOptions);
        }
    };

    const removeProfilePic = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        };
        try {
            const { data } = await axios.put(
                `${profilePicUpdateRoute}`,
                { userId: user._id, removeProfilePic: true },
                config
            );
            setUser(data.updatedUser);
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);
            setShowProfilePicOptions(false);
            toast.success("Profile picture removed!", toastOptions);
        } catch (error) {
            toast.error("Something went wrong", toastOptions);
        }
    };

    const deleteAccount = async () => {
        setModalUpdateActive("not");
        setDeleteActive("yes");
        setWarnText("You cannot restore your account. All your chats and messages will be permanently deleted.");
        setSubmText("Are you sure you want to leave your contacts and delete an account in CHAT_ON?")
    };

    const handleDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, } };
            const { data } = await axios.put(`${deleteUserRoute}`, { userId: user._id, }, config);
            setFetchAgain(!fetchAgain);
            toast.success("Your account is successfully deleted", toastOptions);
            if (data.status === true) {
                localStorage.clear();
                navigate("/auth");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage, toastOptions);
        }
    };

    return (
        <div className="user-info">
            <div className="user-profile-section">
                <div className="user-info-layout">
                    <div className="left-division">
                        <div 
                            className="profile-pic-container tooltip" 
                            onClick={() => setShowProfilePicOptions(!showProfilePicOptions)}
                        >
                            <img src={getProfilePicUrl(user.profilePic, user.gender, profilePicVersion)}
                                alt={user.username} className="profile-pic" />
                            <div className="edit-overlay">
                                <RxPencil2 />
                            </div>
                            <span className="tooltiptext">{user.username}</span>
                            
                            {showProfilePicOptions && (
                                <div className="profile-pic-options" onClick={(e) => e.stopPropagation()}>
                                    <label className="option-item">
                                        <input
                                            type="file"
                                            name="profilePic"
                                            accept="image/*"
                                            onChange={(event) => imageUpload(event)}
                                            style={{ display: 'none' }}
                                        />
                                        <RxUpload /> Upload Photo
                                    </label>
                                    <button 
                                        className="option-item remove"
                                        onClick={removeProfilePic}
                                    >
                                        <BsTrash /> Remove Photo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="right-division">
                        <button className="icon-button" onClick={() => setModalUpdateActive("edit")}>Edit</button>
                        <button className="icon-button" onClick={() => setModalUpdateActive("group")}>Create Group</button>
                        <button className="icon-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                {modalUpdateActive === "edit" && (
                    <UpdateProfile 
                        fetchAgain={fetchAgain} 
                        setFetchAgain={setFetchAgain}
                        setModalActive={setModalUpdateActive} 
                        handleDelete={deleteAccount} 
                    />
                )}

                {modalUpdateActive === "group" && (
                    <CreateGroupChat
                        setModalActive={setModalUpdateActive}
                    />
                )}

                {deleteActive === "yes" && (
                    <SubmitModal 
                        setModalActive={setDeleteActive} 
                        warnText={warnText}
                        submText={submText} 
                        handleFunction={handleDelete} 
                    />
                )}
            </div>
        </div>
    );
}

export default UserInfo;