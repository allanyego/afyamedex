import request, { constructAuthHeader } from "./request";

const BASE_URL = "/users";

export async function getUsers(
  token,
  { username = undefined, patient = false } = {}
) {
  let queryParams = "";
  if (username && patient) {
    queryParams += `?username=${encodeURIComponent(username)}&patient=true`;
  } else if (username) {
    queryParams += `?username=${encodeURIComponent(username)}`;
  } else if (patient) {
    queryParams += `?patient=true`;
  }

  return await request(`${BASE_URL}/${queryParams}`, {
    headers: constructAuthHeader(token),
  });
}

export async function signIn(username, password) {
  return await request(`${BASE_URL}/signin`, {
    method: "POST",
    data: {
      username,
      password,
    },
  });
}

export async function signUp(userData) {
  return await request(BASE_URL, {
    method: "POST",
    data: userData,
  });
}

export async function editUser(userId, token, data, multiPart = false) {
  const url = `${BASE_URL}/${userId}`;
  return await request(url, {
    method: "PUT",
    headers: constructAuthHeader(token),
    data,
    multiPart,
  });
}

export async function getById(userId) {
  return await request(`${BASE_URL}/${userId}`, {});
}

export async function resetPassword(username) {
  return await request(`${BASE_URL}/reset-password`, {
    method: "POST",
    data: {
      username,
    },
  });
}

export async function confirmReset(username, newPassword, resetCode) {
  return await request(`${BASE_URL}/confirm-reset`, {
    method: "POST",
    data: {
      username,
      newPassword,
      resetCode,
    },
  });
}

export async function addNotificationToken(userId, notificationToken, token) {
  return await request(`${BASE_URL}/notifications/${userId}`, {
    method: "POST",
    data: {
      token: notificationToken,
    },
    headers: constructAuthHeader(token),
  });
}

export async function removeNotificationToken(
  userId,
  notificationToken,
  token
) {
  return await request(`${BASE_URL}/notifications/${userId}?remove=true`, {
    method: "POST",
    data: {
      token: notificationToken,
    },
    headers: constructAuthHeader(token),
  });
}
