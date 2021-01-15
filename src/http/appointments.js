import request, { constructAuthHeader } from "./request";

const BASE_URL = "/appointments";

export async function getAppointment(appointmentId, token) {
  return await request(`${BASE_URL}/appointment/${appointmentId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getAppointments(userId, token) {
  return await request(`${BASE_URL}/${userId}`, {
    headers: constructAuthHeader(token),
  });
}

export async function getPayments(userId, token) {
  return await request(`${BASE_URL}/${userId}/payments`, {
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

export async function editAppointment(
  appointmentId,
  token,
  data,
  multiPart = false
) {
  return await request(`${BASE_URL}/${appointmentId}`, {
    method: "PUT",
    headers: constructAuthHeader(token),
    data,
    multiPart,
  });
}

export async function checkout(appointmentId, token, data) {
  return await request(`${BASE_URL}/checkout/${appointmentId}`, {
    method: "GET",
    headers: constructAuthHeader(token),
    data,
  });
}
