import { SERVER_URL_DEV } from "./constants";
import request, { constructAuthHeader } from "./request";

const BASE_URL = SERVER_URL_DEV + "/messages";

export async function getUserThreads(userId, token) {
  return request(`${BASE_URL}/user-threads/${userId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getThreadMessages(threadId, token) {
  return await request(`${BASE_URL}/${threadId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function sendMessage(data, token) {
  return await request(BASE_URL, {
    method: "POST",
    headers: constructAuthHeader(token),
    data,
  });
}

export async function getUserMessages(users, token) {
  const url = `${BASE_URL}/user-messages?users=${users.join(";")}`;
  return await request(url, {
    headers: constructAuthHeader(token),
  });
}
