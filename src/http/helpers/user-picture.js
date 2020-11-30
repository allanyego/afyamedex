import { SERVER_URL } from "../constants";
import defaultAvatar from "../../assets/img/default_avatar.jpg";

export default function userPicture(user) {
  return user && user.picture
    ? `${SERVER_URL}/users/picture/${user.picture}`
    : defaultAvatar;
}
