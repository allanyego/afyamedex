import React, { useState, useRef, useEffect } from "react";
import { IonPage, IonContent, IonFooter, IonButtons, IonButton, IonIcon, IonHeader, IonBackButton, IonToolbar, IonTitle, IonGrid, IonRow, IonCard, IonCol, IonText, IonTextarea, useIonViewWillLeave, useIonViewDidEnter } from "@ionic/react";
import { attachOutline, callOutline, sendOutline } from "ionicons/icons";
import moment from "moment";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import "./Thread.css";
import { useParams, useLocation, useHistory } from "react-router";
import { getThreadMessages, getUserMessages, sendMessage } from "../http/messages";
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import useSocket from "../lib/socket-hook";
import useMounted from "../lib/mounted-hook";

const messageSchema = Yup.object({
  body: Yup.string().required("Message can't be blank"),
});

const Thread: React.FC = () => {
  let [messages, setMessages] = useState<any[] | null>(null);
  const { threadId } = useParams();
  const { state: otherUser } = useLocation() as any;
  const [roomJoined, setRoomJoined] = useState<string | null>(null);
  const history = useHistory();
  const chatGrid = useRef<any | null>(null);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();
  const socket = useSocket();


  const setupIO = (room: string) => {
    isMounted && setRoomJoined(room);

    socket.emit("join", {
      room,
    });

    socket.on("new-message", ({ message }: any) => {
      addMessage(message);
    });
  };

  const scrollBottomToView = () => {
    const el = document.querySelector(".chat-grid");
    el!.scrollTop = el!.scrollHeight;
  };

  const addMessage = (msg: any) => {
    isMounted && setMessages((msgs: any) => [
      ...msgs, msg,
    ]);
  };

  const pushMessage = (msg: any) => {
    !roomJoined && setupIO(msg.thread);
    addMessage(msg);
    // Notify room of new message
    socket.emit("new-message", {
      room: msg.thread,
      message: msg,
    });
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    if (otherUser && !otherUser.fullName) {
      history.replace("/app/chat");
      return;
    }

    if (otherUser && !otherUser.fetch) {
      setupIO(threadId);
      getThreadMessages(threadId, currentUser.token, !otherUser.username).then(({ data }: any) => {
        isMounted && setMessages(data);
        scrollBottomToView();
      }).catch(error => onError(error.message));
    } else if (otherUser && otherUser.fetch) {
      getUserMessages([
        currentUser._id,
        otherUser._id,
      ], currentUser.token).then(({ data }: any) => {
        isMounted && setMessages(data);
        // Subscribe to thread now
        if (data.length) {
          setupIO(data[0].thread);
        }
        scrollBottomToView();
      }).catch(error => onError(error.message));
    } else {
      history.replace("/app/chat");
      return;
    }
  }, []);

  useIonViewWillLeave(() => {
    socket.emit("left-room", {
      room: roomJoined,
    });
    setMounted(false);
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app" />
          </IonButtons>
          <IonTitle className="ion-text-capitalize">
            {otherUser && otherUser.fullName}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!messages ? (
          <LoadingFallback />
        ) : (
            <IonGrid ref={chatGrid as any} className="chat-grid">
              {messages.map((msg: any) => <Message key={msg._id} message={msg} />)}
            </IonGrid>
          )}
        <div className="inbox-bottom-show"></div>
      </IonContent>
      <MessageBoxFooter
        threadId={threadId}
        addMessage={pushMessage}
      />
    </IonPage>
  );
};

export default Thread;

function Message({ message }: any) {
  const { currentUser } = useAppContext() as any;

  return (
    <IonRow className={message.sender._id === currentUser._id ? "ion-justify-content-end me" : "other"}>
      <IonCol size="7">
        <IonCard className="ion-padding message-bubble">
          <IonText>
            <h5 className="ion-no-margin ion-text-capitalize">{message.sender.fullName}</h5>
            <p className="ion-no-margin">{message.body}</p>
          </IonText>
          <IonText color="medium"><small className="ion-float-right">{moment(message.createdAt).format('LT')}</small></IonText>
        </IonCard>
      </IonCol>
    </IonRow>
  );
}

function MessageBoxFooter({ threadId, addMessage }: any) {
  const { state: otherUser } = useLocation<any>();
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const noThread = threadId === "no-thread";
  const isPublicThread = !otherUser?._id;

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const newMessage = {
        ...values,
        sender: currentUser._id,
      };

      if (!isPublicThread) {
        newMessage.recipient = otherUser._id;
      }

      if (!noThread) {
        newMessage.thread = threadId;
      }

      const { data } = await sendMessage(newMessage, currentUser.token);
      setSubmitting(false);
      resetForm({});

      const postedMessage = {
        ...data,
        sender: {
          fullName: currentUser.fullName,
          _id: currentUser._id,
        },
      }

      addMessage(postedMessage);
    } catch (error) {
      setSubmitting(false);
      onError(error.message);
    }
  };

  return (
    <IonFooter>
      <Formik
        validationSchema={messageSchema}
        onSubmit={handleSubmit}
        initialValues={{}}
      >
        {({
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
          isValid,
          isSubmitting,
        }: any) => (
            <Form noValidate>
              <IonGrid>
                <IonRow>
                  <IonCol size="3" className="ion-no-padding d-flex ion-align-items-center ion-justify-content-center">
                    <IonButtons>
                      <IonButton color="secondary">
                        <IonIcon slot="icon-only" icon={callOutline} />
                      </IonButton>
                      <IonButton color="secondary">
                        <IonIcon slot="icon-only" icon={attachOutline} />
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                  <IonCol size="7" className="ion-no-padding d-flex ion-align-items-center message-col">
                    <IonTextarea
                      value={values.body}
                      rows={1}
                      className={`ion-no-margin ${touched.body && errors.body ? " has-error" : ""}`}
                      name="body"
                      onIonChange={handleChange}
                      onIonBlur={handleBlur}
                    />
                  </IonCol>
                  <IonCol size="2" className="ion-no-padding d-flex ion-align-items-center ion-justify-content-center">
                    <IonButtons>
                      <IonButton color="secondary" disabled={!isValid || isSubmitting} type="submit">
                        <IonIcon slot="icon-only" icon={sendOutline} />
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </Form>
          )}
      </Formik>
    </IonFooter>
  );
}