import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonItem, IonAvatar, IonList, IonLabel, IonText, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";

import defaultAvatar from "../assets/img/default_avatar.jpg";
import { useRouteMatch, useHistory } from "react-router";
import { useAppContext } from "../lib/context-lib";
import { getUserThreads } from "../http/messages";
import UserHeader from "../components/UserHeader";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";

export default function Chat() {
  let [threads, setThreads] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(() => {
    getUserThreads(currentUser._id, currentUser.token).then(({ data }) => {
      isMounted && setThreads(data);
    }).catch(error => {
      isMounted && setLoadError(true);
      onError(error.message)
    });
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <UserHeader title="Chat" />
      <IonContent fullscreen>

        {loadError ? (
          <ErrorFallback />
        ) : !threads ? (
          <LoadingFallback />
        ) : (
              <IonList>
                {threads.map((thread: any) => <ThreadRibbon key={thread._id} thread={thread} />)}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  );
}

function ThreadRibbon({ thread }: any) {
  const history = useHistory();
  const { currentUser } = useAppContext() as any;
  const otherUser = thread.participants.filter(
    (user: any) => user._id !== currentUser._id
  )[0];

  const toThread = () => history.push({
    pathname: `/app/chat/${thread._id}`,
    state: otherUser,
  });

  return (
    <IonItem onClick={toThread}>
      <IonAvatar slot="start">
        <img src={defaultAvatar} alt={otherUser.fullName} />
      </IonAvatar>
      <IonLabel>
        <h2 className="ion-text-capitalize">{otherUser.fullName}</h2>
        <IonText color="medium">{thread.lastMessage.body}</IonText>
      </IonLabel>
    </IonItem>
  );
}