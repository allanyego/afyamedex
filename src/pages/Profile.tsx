import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonRow, IonGrid, IonButtons, IonBackButton, IonHeader, IonToolbar, IonTitle, useIonViewDidEnter, useIonViewWillLeave, IonRouterOutlet } from "@ionic/react";
import { useParams, useRouteMatch, Router, Route, useHistory } from "react-router";

import { getById } from "../http/users";
import { useAppContext } from "../lib/context-lib";
import UserDetails, { ProfileData } from "../components/UserDetails";
import LoadingFallback from "../components/LoadingFallback";
import useToastManager from "../lib/toast-hook";
import "./Profile.css";
import UserProfile from "../components/UserProfile";
import useMounted from "../lib/mounted-hook";

const ProfileCurrentUser: React.FC = () => {
  const [user, setUser] = useState<ProfileData | null>(null);
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(() => {
    isMounted && setUser(currentUser);
  });

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return <UserProfile user={user} />
};

const ProfileOtherUser: React.FC = () => {
  const [user, setUser] = useState<ProfileData | null>(null);
  const { userId } = useParams();
  const history = useHistory();
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(() => {
    getById(userId).then(({ data }: any) => {
      if (!isMounted) {
        return;
      }

      if (data) {
        setUser(data);
      } else {
        onError("No user by that id found");
        history.replace("/app/profile");
      }
    }).catch(error => onError(error.message));
  });

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return <UserProfile user={user} />
};

const Profile: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <IonRouterOutlet>
      <Route path={path} component={ProfileCurrentUser} exact />
      <Route path={`${path}/:userId`} component={ProfileOtherUser} exact />
    </IonRouterOutlet>
  );
}

export default Profile;
