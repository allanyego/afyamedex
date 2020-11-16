import React, { useState, useCallback, useEffect } from "react";
import { IonPage, IonContent, IonItem, IonAvatar, IonList, IonLabel, IonText, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import moment from "moment";

import defaultAvatar from "../assets/img/default_avatar.jpg";
import { useHistory } from "react-router";
import { useAppContext } from "../lib/context-lib";
import { getUserThreads } from "../http/messages";
import UserHeader from "../components/UserHeader";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";
import useSocket from "../lib/socket-hook";

export default function Chat() {
  let [threads, setThreads] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();
  // const socket = useSocket();

  // useEffect(() => {
  //   // Join all of our rooms once online
  //   threads && threads.forEach((thread: any) => socket.emit("join", {
  //     room: thread._id,
  //   }));
  // }, [threads]);

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
      <UserHeader title="Inbox" />
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
  const otherUser = thread.participants.find(
    (user: any) => user._id !== currentUser._id
  );

  const toThread = () => history.push({
    pathname: `/app/chat/${thread._id}`,
    state: {
      ...otherUser,
    },
  });

  return (
    <IonItem onClick={toThread}>
      <IonAvatar slot="start">
        <img src={defaultAvatar} alt={otherUser.fullName} />
      </IonAvatar>
      <IonLabel>
        <div className="d-flex ion-justify-content-center ion-align-items-center">
          <div style={{
            flexGrow: 1,
            overflow: "hidden",
            marginRight: "0.8em",
          }}>
            <h2 className="ion-text-capitalize">{otherUser.fullName}</h2>
          </div>
          <small>
            <i>
              <IonText color="medium">
                {moment(thread.lastMessage.createdAt).format("l")}
              </IonText>
            </i>
          </small>
        </div>
        <IonText color="medium">{thread.lastMessage.body}</IonText>
      </IonLabel>
    </IonItem>
  );
}