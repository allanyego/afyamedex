import React, { useEffect } from "react";
import { useRouteMatch, Route, Redirect } from "react-router";
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillLeave, IonPage } from "@ionic/react";
import { helpCircleSharp, peopleCircleSharp, chatbubblesSharp, fileTrayFullSharp } from "ionicons/icons";
import io from "socket.io-client";

import Conditions from "./Conditions";
import Chat from "./Chat";
import Listing from "./Listing";
import Thread from "./Thread";
import Condition from "./Condition";
import BookAppointment from "./BookAppointment";
import NewCondition from "./NewCondition";
import Appointments from "./Appointments";
import { useAppContext } from "../lib/context-lib";
import { USER, ROOT_URL } from "../http/constants";
import Profile from "./Profile";
import useMounted from "../lib/mounted-hook";
import Checkout from "./Checkout";
import Feed from "./Feed";

const Main: React.FC = () => {
  const { url, path } = useRouteMatch();
  const { currentUser, socket, setSocket } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const handleSocketErr = (err: Error) => {
    console.log("Socket error", err);
  };

  useEffect(() => {
    const _socket = io(ROOT_URL, {
      query: {
        userId: currentUser._id,
      },
      forceNew: true,
    });

    _socket.on("error", handleSocketErr);
    _socket.on("connect_error", handleSocketErr);
    _socket.on("connect_timeout", handleSocketErr);

    setSocket(_socket);

    return () => {
      socket && socket.close();
      isMounted && setSocket(null);
    }
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={path} exact={true} render={() => <Redirect to={`${path}/feed`} />} />
        <Route path={`${path}/feed`} component={Feed} exact />
        <Route path={`${path}/appointments`} component={Appointments} exact />
        <Route path={`${path}/checkout/:appointmentId`} component={Checkout} exact />
        <Route path={`${path}/info`} component={ConditionsRouter} />
        <Route path={`${path}/chat`} component={ChatRouter} />
        <Route path={`${path}/professionals`} component={ProfessionalsRouter} />
        <Route path={`${path}/profile`} component={Profile} />
      </IonRouterOutlet>
    </IonPage>
  );

  // return (
  //   <IonTabs className="page-tabs">
  //     <IonRouterOutlet>
  //       <Route path={path} exact={true} render={() => <Redirect to={`${path}/info`} />} />
  //       <Route path={`${path}/appointments`} component={Appointments} exact />
  //       <Route path={`${path}/info`} component={ConditionsRouter} />
  //       <Route path={`${path}/chat`} component={ChatRouter} />
  //       <Route path={`${path}/professionals`} component={ProfessionalsRouter} />
  //       <Route path={`${path}/profile`} component={Profile} />
  //     </IonRouterOutlet>
  //     <IonTabBar slot="bottom" className="page-tab-bar">
  //       <IonTabButton tab="info" href={`${url}/info`}>
  //         <IonIcon icon={helpCircleSharp} />
  //         <IonLabel>Info Center</IonLabel>
  //       </IonTabButton>

  //       {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
  //         <IonTabButton tab="professionals" href="/app/professionals">
  //           <IonIcon icon={peopleCircleSharp} />
  //           <IonLabel>Browse</IonLabel>
  //         </IonTabButton>
  //       ) : (
  //           <IonTabButton tab="appointments" href="/app/appointments">
  //             <IonIcon icon={fileTrayFullSharp} />
  //             <IonLabel>Appointments</IonLabel>
  //           </IonTabButton>
  //         )
  //       }

  //       <IonTabButton tab="chat" href="/app/chat">
  //         <IonIcon icon={chatbubblesSharp} />
  //         <IonLabel>Chat</IonLabel>
  //       </IonTabButton>
  //     </IonTabBar>
  //   </IonTabs>
  // );
};

export default Main;

function ChatRouter() {
  const { path } = useRouteMatch();
  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={path} component={Chat} exact />
        <Route path={`${path}/:threadId`} component={Thread} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

function ConditionsRouter() {
  const { path } = useRouteMatch();
  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={path} component={Conditions} exact />
        <Route path={`${path}/new`} component={NewCondition} exact />
        <Route path={`${path}/:conditionId/details`} component={Condition} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

function ProfessionalsRouter() {
  const { path } = useRouteMatch();
  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={path} component={Listing} exact />
        <Route path={`${path}/:professionalId/book`} component={BookAppointment} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}