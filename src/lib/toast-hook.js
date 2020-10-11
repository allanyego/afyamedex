import { useState } from "react";
import { NOTIFICATION_TYPES } from "../components/ToastManager";
import { useAppContext } from "./context-lib";

export default function useToastManager() {
  // const [notifications, setNotifocations] = useState([]);
  const { notifications, setNotifications } = useAppContext();

  const popNotification = () => {
    const prev = notifications;
    setNotifications(prev.slice(1, prev.length));
  };

  const pushNotification = (message, type) =>
    setNotifications([
      ...notifications,
      {
        message,
        type,
        _id: Date.now(),
      },
    ]);

  const onError = (message) =>
    pushNotification(message, NOTIFICATION_TYPES.DANGER);

  const onSuccess = (message) =>
    pushNotification(message, NOTIFICATION_TYPES.SUCCESS);

  const onInfo = (message) =>
    pushNotification(message, NOTIFICATION_TYPES.TERTIARY);

  return {
    onError,
    onSuccess,
    onInfo,
    popNotification,
  };
}
