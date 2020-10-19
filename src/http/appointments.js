import request, { constructAuthHeader } from "./request";

const BASE_URL = "/appointments";

export async function getAppointments(userId, token) {
  return await request(`${BASE_URL}/${userId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function post(userId, token, data) {
  return await request(`${BASE_URL}/${userId}`, {
    method: "POST",
    headers: constructAuthHeader(token),
    data,
  });
}

export async function editAppointment(appointmentId, token, data) {
  return await request(`${BASE_URL}/${appointmentId}`, {
    method: "PUT",
    headers: constructAuthHeader(token),
    data,
  });
}

export async function checkout(appointmentId, token, data) {
  return await request(`${BASE_URL}/checkout/${appointmentId}`, {
    method: "GET",
    headers: constructAuthHeader(token),
    data,
  });
}
