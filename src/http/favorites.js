import request, { constructAuthHeader } from "./request";

const BASE_URL = "/favorites";

export async function checkIfFavorited(userId, token) {
  return await request(`${BASE_URL}?favorited=${userId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function favorite(userId, token) {
  return await request(`${BASE_URL}/${userId}`, {
    method: "POST",
    headers: constructAuthHeader(token),
  });
}
