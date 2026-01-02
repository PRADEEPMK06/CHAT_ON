export const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
};
export const host = "http://localhost:5000";

export const registerRoute = `${host}/api/user/register`;
export const loginRoute = `${host}/api/user/login`;
export const allUsersRoute = `${host}/api/user/getAllUsers`;

export const sendMessageRoute = `${host}/api/message/sendMessage`;
export const getAllMessageRoute = `${host}/api/message/getAllMessage`;

export const createGroupRoute = `${host}/api/group/createGroupChat`;
export const updateGroupRoute = `${host}/api/group/updateGroupChat`;
