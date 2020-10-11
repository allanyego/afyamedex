export default async function (url, { method = "GET", data, headers = {} }) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (data) {
    opts.body = JSON.stringify(data);
  }

  const resp = await fetch(url, opts);

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
