import request, { constructAuthHeader } from "./request";

const BASE_URL = "/conditions";

export async function getConditions(token, search = null) {
  return await request(`${BASE_URL + (!!search ? "?search=" + search : "")}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getById(id, token) {
  return await request(`${BASE_URL}/${id}`, {
    headers: constructAuthHeader(token),
  });
}

export async function addCondition(token, data, multiPart = false) {
  return await request(BASE_URL, {
    method: "POST",
    data,
    headers: constructAuthHeader(token),
    multiPart,
  });
}
