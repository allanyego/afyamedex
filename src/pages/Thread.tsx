import React, { useEffect, useState, useRef } from "react";
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

const messageSchema = Yup.object({
  body: Yup.string().required("Message can't be blank"),
});

const Thread: React.FC = () => {
  let [messages, setMessages] = useState<any[] | null>(null);
  const { threadId } = useParams();
  const { state } = useLocation() as any;
  const [otherUser] = useState(state);
  const history = useHistory();
  const chatGrid = useRef<any | null>(null);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const socket = useSocket();

  const scrollBottomToView = () => {
    const el = document.querySelector(".chat-grid");
    el!.scrollTop = el!.scrollHeight;
  };

  const addMessage = (msg: any) => {
    setMessages((msgs: any) => [
      ...msgs, msg,
    ]);
  };

  useEffect(() => {
    socket.on("new-message", ({ message }: any) => {
      addMessage(message);
      scrollBottomToView();
    });
  }, []);

  useIonViewDidEnter(() => {
    if (state && !state.fullName) {
      history.replace("/app/chat");
      return;
    }

    socket.emit("join", {
      room: threadId,
    });

    if (state && !state.fetch) {
      getThreadMessages(threadId, currentUser.token, !state.username).then(({ data }: any) => {
        setMessages(data);
        scrollBottomToView();
      }).catch(error => onError(error.message));
    } else if (state && state.fetch) {
      getUserMessages([
        currentUser._id,
        state._id,
      ], currentUser.token).then(({ data }: any) => {
        setMessages(data);
        // Subscribe to thread now
        if (data.length) {
          socket.emit("join", {
            room: data[0].thread,
          });
        }
        scrollBottomToView();
      }).catch(error => onError(error.message));
    } else {
      history.replace("/app/chat");
      return;
    }
  }, []);

  useIonViewWillLeave(() => {
    setMessages = () => null;
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
        currentUser={currentUser}
        otherUser={state}
        addMessage={addMessage}
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

function MessageBoxFooter({ threadId, currentUser, otherUser, addMessage }: any) {
  const { onError } = useToastManager();
  const socket = useSocket();

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const noThread = threadId !== "no-thread";
      const isPublicThread = !otherUser.username;

      const newMessage = {
        sender: currentUser._id,
        ...values,
      };

      if (!isPublicThread) {
        newMessage.recipient = otherUser._id;
      }

      if (noThread) {
        newMessage.thread = threadId;
      }

      const { data } = await sendMessage(newMessage, currentUser.token);
      setSubmitting(false);
      resetForm({});
      const postedMessage = {
        ...data.lastMessage,
        sender: {
          fullName: currentUser.fullName,
          _id: currentUser._id,
        },
      }
      if (noThread) {
        // Join room if it is a new thread
        socket.emit("join", {
          room: data._id,
        });
      }
      // Notify room of new message
      socket.emit("new-message", {
        room: data._id,
        message: postedMessage,
      });
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