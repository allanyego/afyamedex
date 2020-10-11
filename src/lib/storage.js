import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;

export async function setObject(key, value) {
  return await Storage.set({
    key,
    value: JSON.stringify(value),
  });
}

export async function getObject(key) {
  const { value } = await Storage.get({ key });
  return JSON.parse(value);
}

export async function clear() {
  return await Storage.clear();
}
