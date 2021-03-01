import React, { useState } from "react";
import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed } from '@capacitor/core';
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";
import { IonButton, IonCard, IonCardContent, IonText } from "@ionic/react";
import { addNotificationToken, removeNotificationToken } from "../http/users";

const { PushNotifications } = Plugins;

const NotificationsCTA: React.FC = () => {
  const [isUpdating, setUpdating] = useState(false);
  const { currentUser, setCurrentUser } = useAppContext() as any;
  const { onError, onInfo } = useToastManager();

  const removePushNotifications = async () => {
    setUpdating(true);
    try {
      await removeNotificationToken(currentUser._id,)
      setCurrentUser({
        pushNotifications: null,
      });
      setUpdating(false);
    } catch (error) {
      onError(error.message);
      setUpdating(false);
    }
  }

  const addPushNotifications = async () => {
    setUpdating(true);

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On succcess, we should be able to receive notifications
    PushNotifications.addListener('registration',
      async ({ value }: PushNotificationToken) => {
        try {
          await addNotificationToken(currentUser._id, value, currentUser.token);
          onInfo('Push registration success');
          setCurrentUser({
            pushNotifications: value,
          });
          setUpdating(false);
        } catch (error) {
          setUpdating(false);
          onError(error.message);
        }
      }
    );

    // Some issue with your setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        onError('Error on registration for push notifications.');
        setUpdating(false);
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      // TODO
      (notification: PushNotification) => {
        //   let notif = this.state.notifications;
        //   notif.push({ id: notification.id, title: notification.title, body: notification.body })
        //   this.setState({
        //     notifications: notif
        //   })
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      // TODO
      (notification: PushNotificationActionPerformed) => {
        //   let notif = this.state.notifications;
        //   notif.push({ id: notification.notification.data.id, title: notification.notification.data.title, body: notification.notification.data.body })
        //   this.setState({
        //     notifications: notif
        //   })
      }
    );
  }

  return (
    <IonCard>
      <IonCardContent>
        <p className="ion-no-margin ion-text-center">
          Notifications <IonText color={currentUser.pushNotifications ? "success" : "danger"}>
            <strong>{currentUser.pushNotifications ? "ON" : "OFF"}</strong>
          </IonText>
        </p>
        <IonButton
          expand="block"
          shape="round"
          color="secondary"
          onClick={currentUser.pushNotifications ? removePushNotifications : addPushNotifications}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : `Turn ${currentUser.pushNotifications ? "off" : "on"}`}
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default NotificationsCTA;