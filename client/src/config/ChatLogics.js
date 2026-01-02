export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isAnotherSender = (message, userId) => {
  return message.sender._id !== userId
};

export const isGroupRecieved = (message, chat, userId) => {
  return message.sender._id !== userId &&
    chat.isGroupChat;
};

export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].username : users[0].username;
};

export const getSenderProfilePic = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].profilePic : users[0].profilePic;
};

export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isLastMessage = (messages, message, i) => {
  return i === 0 || messages[i - 1].sender._id !== message.sender._id
};

// Format message timestamp to local time with proper formatting
export const formatMessageTime = (createdAt) => {
  const date = new Date(createdAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  const time = date.toLocaleTimeString(undefined, timeOptions);

  if (isToday) {
    return time;
  } else if (isYesterday) {
    return `Yesterday ${time}`;
  } else {
    const dateOptions = { month: 'short', day: 'numeric' };
    return `${date.toLocaleDateString(undefined, dateOptions)} ${time}`;
  }
};