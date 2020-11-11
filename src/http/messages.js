import request, { constructAuthHeader } from "./request";

const BASE_URL = "/messages";

export async function getPublicThreads(token) {
  return await request(BASE_URL, {
    headers: constructAuthHeader(token),
  });
}

export async function getUserThreads(userId, token) {
  return await request(`${BASE_URL}/user-threads/${userId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getThreadMessages(threadId, token, pub = false) {
  const search = pub ? "?public=true" : "";
  return await request(`${BASE_URL}/${threadId + search}`, {
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
