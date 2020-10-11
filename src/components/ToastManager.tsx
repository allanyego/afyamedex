import React from "react";
import { IonToast } from "@ionic/react";
import useToastManager from "../lib/toast-hook";
import { useAppContext } from "../lib/context-lib";

export const NOTIFICATION_TYPES = {
  DARK: "dark",
  DANGER: "danger",
  TERTIARY: "tertiary",
  SUCCESS: "success",
};

const ToastManager: React.FC = () => {
  const { popNotification } = useToastManager();
  const { notifications } = useAppContext() as any;

  return (
    <>
      {notifications.map((notification: any) => (
        <IonToast
          key={notification._id}
          isOpen={true}
          position="top"
          onDidDismiss={popNotification}
          message={notification.message}
          color={notification.type}
          duration={1600}
        />
      ))}
    </>
  );
};

export default ToastManager;