import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonRow, IonGrid, IonButtons, IonBackButton, IonHeader, IonToolbar, IonTitle, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import { useParams } from "react-router";

import { getById } from "../http/users";
import { useAppContext } from "../lib/context-lib";
import UserDetails, { ProfileData } from "../components/UserDetails";
import LoadingFallback from "../components/LoadingFallback";
import useToastManager from "../lib/toast-hook";
import "./Profile.css";

const Profile: React.FC = () => {
  const { userId } = useParams();
  let [user, setUser] = useState<ProfileData | null>(null);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  useIonViewDidEnter(() => {
    if (userId) {
      getById(userId).then(({ data }: any) => {
        if (data) {
          setUser(data);
        } else {
          setUser(currentUser);
        }
      }).catch(error => onError(error.message));
    } else {
      setUser(currentUser);
    }
  }, []);

  useIonViewWillLeave(() => {
    setUser = () => null;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/info" />
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {!user ? (
          <LoadingFallback />
        ) : (
            <IonGrid>
              <IonRow>
                <UserDetails user={user} />
              </IonRow>
            </IonGrid>
          )}
      </IonContent>
    </IonPage>
  );
}

export default Profile;
