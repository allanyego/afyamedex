import request from "./request";

const BASE_URL = "/conditions";

export async function getConditions(search) {
  return await request(
    `${BASE_URL + (!!search ? "?search=" + search : "")}`,
    {}
  );
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
