import { SERVER_URL } from "./constants";

export default async function (
  url,
  { method = "GET", data, headers = {}, multiPart = false }
) {
  const opts = {
    method,
    headers: {
      ...headers,
    },
  };

  if (data) {
    if (!multiPart) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(data);
    } else {
      const formData = new FormData();
      for (let key of Object.keys(data)) {
        formData.append(key, data[key]);
      }

      opts.body = formData;
    }
  }

  const resp = await fetch(SERVER_URL + url, opts);

  if (resp.status === 500) {
    throw new Error(resp.statusText);
  }

  const body = await resp.json();
  if (body.error) {
    throw new Error(body.error);
  }

  return body;
}

export function constructAuthHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
