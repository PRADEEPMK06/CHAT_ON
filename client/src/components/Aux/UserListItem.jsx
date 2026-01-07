import { getProfilePicUrl } from "../../utils/profileUtils";

const UserListItem = ({ handleFunction, result }) => {
  return (
    <div className="contact"
      onClick={handleFunction}
    >
      <div className="avatar" key={result._id}>
        <img
          alt={result.username}
          src={getProfilePicUrl(result.profilePic, result.gender)}
        />
      </div>
        <h4>{result.username}</h4>
    </div>
  );
};

export default UserListItem;
