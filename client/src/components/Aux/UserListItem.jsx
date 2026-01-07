import { getProfilePicUrl } from "../../utils/profileUtils";
import { ChatState } from "../../context/ChatProvider";

const UserListItem = ({ handleFunction, result }) => {
  const { profilePicVersion } = ChatState();
  
  return (
    <div className="contact"
      onClick={handleFunction}
    >
      <div className="avatar" key={result._id}>
        <img
          alt={result.username}
          src={getProfilePicUrl(result.profilePic, result.gender, profilePicVersion)}
        />
      </div>
        <h4>{result.username}</h4>
    </div>
  );
};

export default UserListItem;
