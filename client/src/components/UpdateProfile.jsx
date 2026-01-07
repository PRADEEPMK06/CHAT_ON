import { useState, useRef } from "react";
import { GrFormClose } from "react-icons/gr";
import { BsPencil, BsTrash } from "react-icons/bs";
import { RxEyeOpen, RxEyeClosed, RxUpload } from "react-icons/rx";
import { FiMail, FiLock, FiUnlock } from "react-icons/fi";
import { toast } from "react-toastify";

import axios from "axios";

import { ChatState } from "../context/ChatProvider";
import {
    renameUserRoute,
    emailUpdateRoute,
    profilePicUpdateRoute,
    passwordUpdateRoute
} from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import { getProfilePicUrl } from "../utils/profileUtils";


function UpdateProfile({ fetchAgain, setFetchAgain, setModalActive, handleDelete }) {
    const { user, setUser, profilePicVersion } = ChatState();
    const fileInputRef = useRef(null);
    //new values 
    const [newUsername, setNewUsername] = useState();
    const [newEmail, setNewEmail] = useState();
    const [oldPassword, setOldPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [newPasswordConfirm, setNewPasswordConfirm] = useState();
    //show inputs
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
    //show password
    const [showOld, setShowOld] = useState(false);
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleLocalStorage = (data) => {
        if (data.status === true) {
            localStorage.setItem(
                process.env.REACT_APP_LOCALHOST_KEY,
                JSON.stringify(data.updatedUser)
            );
        }
    }

    const handleRename = async () => {
        setShowUsernameInput(false);
        if (!newUsername) return;
        try {
            const config = {
                headers:
                {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.put(
                `${renameUserRoute}`,
                {
                    userId: user._id, newUsername: newUsername
                }, config
            );
            setUser(data.updatedUser);
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);
            toast.success("your username was changed successfully", toastOptions);
        } catch (error) {
            toast.error(error.response.data.message, toastOptions);
        }
        setNewUsername("");
    };

    const handleEmail = async () => {
        setShowEmailInput(false);
        if (!newEmail) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `${emailUpdateRoute}`,
                {
                    userId: user._id,
                    newEmail: newEmail,
                },
                config
            );
            setUser(data.updatedUser)
            handleLocalStorage(data);
            toast.success("your email was changed successfully", toastOptions);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast.error(error.response.data.message, toastOptions);
        }
        setNewEmail("");
        setShowEmailInput(false);
    };

    const imageUpload = async (event) => {
        event.preventDefault();
        const profilePic = event.target.files[0];
        const formData = new FormData();
        const config = {
            headers:
            {
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
            toast.error("something went wrong", toastOptions);
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

    const handlePassword = async () => {
        setShowPasswordInput(false);
        if (!newPassword || !oldPassword) return;
        if (newPassword !== newPasswordConfirm) {
            toast.error("Password and confirm password should be same.", toastOptions);
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(
                `${passwordUpdateRoute}`, { userId: user._id, oldPassword: oldPassword, newPassword: newPassword }, config
            );
            if (data.status === true) toast.success("your password was changed successfully", toastOptions);
            else toast.error("response.data.message", toastOptions);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast.error(error.response.data.message, toastOptions);
        }
        setOldPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
    };

    return (
        <>
            <div className="modal-wrapper user-update">
                <div className={`modal-container ${showPasswordInput ? "smaller" : ""}`}>
                    <div className="close-button-wrapper">
                        <button className="close-button" onClick={() => { setModalActive("not") }}>
                            <GrFormClose />
                        </button>
                    </div>
                    
                    {/* Banner Section - Static Display */}
                    <div className="banner-section"
                        style={user.bannerPic 
                            ? { backgroundImage: `url(${process.env.REACT_APP_PROFILE_PICS_PATHS + user.bannerPic})` }
                            : { backgroundColor: user.bannerColor || '#87CEEB' }
                        }
                    >
                    </div>
                    
                    <div className="modal-header">
                        <div className="avatar" onClick={() => setShowProfilePicOptions(!showProfilePicOptions)}>
                            <img src={getProfilePicUrl(user.profilePic, user.gender, profilePicVersion)}
                                alt={user.username} />
                            <div className="hover-text">
                                <BsPencil /> Edit
                            </div>
                            
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
                    <div className="modal-content">
                        <div className="inputs">
                            {showUsernameInput
                                ? (<div className="modal-input">
                                    <input
                                        type="text"
                                        placeholder={user.username}
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                    />
                                    <BsPencil />
                                    <button className="button-submit" onClick={handleRename}>Save</button>
                                </div>)
                                : (<div className="modal-input not-show">
                                    <span>Username: </span>
                                    <span>{user.username}</span>
                                    <button className="button-submit" onClick={() => setShowUsernameInput(true)}>
                                        Update
                                    </button>
                                </div>)
                            }
                            {showEmailInput
                                ? (<div className="modal-input">
                                    <input type="email" placeholder={user.email}
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    />
                                    <FiMail />
                                    <button className="button-submit" onClick={handleEmail}>Save</button>
                                </div>)
                                : (<div className="modal-input not-show">
                                    <span>Email: </span>
                                    <span>{user.email}</span>
                                    <button className="button-submit" onClick={() => setShowEmailInput(true)}>Update</button>
                                </div>)
                            }
                            {showPasswordInput
                                ? (<>
                                    <div className="modal-input">
                                        <input
                                            type={`${showOld ? "text" : "password"}`}
                                            placeholder="Old password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                        <FiUnlock />
                                        <RxEyeOpen
                                            className={`${showOld ? "password-icon" : "none"}`}
                                            onClick={() => { setShowOld(false) }}
                                        />
                                        <RxEyeClosed
                                            className={`${!showOld ? "password-icon" : "none"}`}
                                            onClick={() => { setShowOld(true) }}
                                        />
                                    </div>
                                    <div className="modal-input">
                                        <input
                                            type={`${show ? "text" : "password"}`}
                                            placeholder="New password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <FiUnlock />
                                        <RxEyeOpen
                                            className={`${show ? "password-icon" : "none"}`}
                                            onClick={() => { setShow(false) }}
                                        />
                                        <RxEyeClosed
                                            className={`${!show ? "password-icon" : "none"}`}
                                            onClick={() => { setShow(true) }}
                                        />
                                    </div>
                                    <div className="modal-input">
                                        <input
                                            type={`${showConfirm ? "text" : "password"}`}
                                            placeholder="Confirm new password"
                                            name="confirmPassword"
                                            value={newPasswordConfirm}
                                            onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                        />
                                        <FiLock />
                                        <RxEyeOpen
                                            className={`${showConfirm ? "password-icon" : "none"}`}
                                            onClick={() => { setShowConfirm(false) }}
                                        />
                                        <RxEyeClosed
                                            className={`${showConfirm ? "none" : "password-icon"}`}
                                            onClick={() => { setShowConfirm(true) }}
                                        />
                                        <button className="button-submit" onClick={handlePassword}>Save</button>
                                    </div>
                                </>)
                                : (<div className="modal-input not-show">
                                    <span>Password: </span>
                                    <span>********</span>
                                    <button className="button-submit" onClick={() => setShowPasswordInput(true)}>Update</button>
                                </div>)
                            }
                        </div>
                        <div className="delete">
                            <span onClick={handleDelete}>Delete account...</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UpdateProfile;