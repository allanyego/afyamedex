import React, { Suspense, useEffect } from "react";
import { useRouteMatch, Route, Redirect } from "react-router";
import { IonRouterOutlet, useIonViewWillLeave, IonPage } from "@ionic/react";
import io from "socket.io-client";

import { useAppContext } from "../lib/context-lib";
import { ROOT_URL } from "../http/constants";
import Profile from "./Profile";
import useMounted from "../lib/mounted-hook";
import Feed from "./Feed";
import SuspenseFallback from "../components/SuspenseFallback";

const AppointmentsRouter = React.lazy(() => import("./routes/Appointments"));
const ConditionsRouter = React.lazy(() => import("./routes/Conditions"));
const ChatsRouter = React.lazy(() => import("./routes/Chats"));
const ProfessionalsRouter = React.lazy(() => import("./routes/Professionals"));

const Main: React.FC = () => {
  const { path } = useRouteMatch();
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
      <Suspense fallback={<SuspenseFallback />}>
        <IonRouterOutlet>
          <Route path={`${path}/feed`} component={Feed} exact />
          <Route path={`${path}/appointments`} component={AppointmentsRouter} />
          <Route path={`${path}/info`} component={ConditionsRouter} />
          <Route path={`${path}/chat`} component={ChatsRouter} />
          <Route path={`${path}/profile`} component={Profile} />
          <Route path={`${path}/professionals`} component={ProfessionalsRouter} />
          <Route render={() => <Redirect to={`${path}/feed`} />} />
        </IonRouterOutlet>
      </Suspense>
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