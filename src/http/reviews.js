import request, { constructAuthHeader } from "./request";

const BASE_URL = "/reviews";

export async function getSessionReview(sessionId, token) {
  return await request(`${BASE_URL}/${sessionId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getUserRating(userId, token) {
  return await request(`${BASE_URL}/user/${userId}?rating=true`, {
    headers: constructAuthHeader(token),
  });
}

export async function addReview(sessionId, token, data) {
  return await request(`${BASE_URL}/${sessionId}`, {
    method: "POST",
    data,
    headers: constructAuthHeader(token),
  });
}
