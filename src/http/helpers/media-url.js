import { SERVER_URL } from "../constants";

export default function mediaUrl(conditionId) {
  return `${SERVER_URL}/conditions/media/${conditionId}`;
}
