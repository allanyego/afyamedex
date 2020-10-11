import { SERVER_URL_DEV } from "./constants";
import request from "./request";

const BASE_URL = SERVER_URL_DEV + "/conditions";

export async function getConditions() {
  return await request(BASE_URL, {});
}

export async function getById(id) {
  return await request(`${BASE_URL}/${id}`, {});
}

export async function addCondition(data, token) {
  return await request(BASE_URL, {
    method: "POST",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
