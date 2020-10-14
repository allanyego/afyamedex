import React from "react";
import { useRouteMatch, Route, Redirect } from "react-router";
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from "@ionic/react";
import { helpCircleSharp, peopleCircleSharp, chatbubblesSharp, fileTrayFullSharp } from "ionicons/icons";

import Conditions from "./Conditions";
import Chat from "./Chat";
import Listing from "./Listing";
import Thread from "./Thread";
import Condition from "./Condition";
import BookAppointment from "./BookAppointment";
import NewCondition from "./NewCondition";
import Appointments from "./Appointments";
import { useAppContext } from "../lib/context-lib";
import { USER } from "../http/constants";
import Profile from "./Profile";

const Main: React.FC = () => {
  const { url, path } = useRouteMatch();
  const { currentUser } = useAppContext() as any;

  return (
    <IonTabs className="page-tabs">
      <IonRouterOutlet>
        <Route path={path} exact={true} render={() => <Redirect to={`${path}/info`} />} />
        <Route path={`${path}/info`} component={ConditionsRouter} />
        <Route path={`${path}/chat`} component={ChatRouter} />
        <Route path={`${path}/professionals`} component={ProfessionalsRouter} />
        <Route path={`${path}/appointments`} component={Appointments} exact />
        <Route path={`${path}/profile`} component={Profile} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className="page-tab-bar">
        <IonTabButton tab="info" href={`${url}/info`}>
          <IonIcon icon={helpCircleSharp} />
          <IonLabel>Info Center</IonLabel>
        </IonTabButton>

        {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
          <IonTabButton tab="professionals" href="/app/professionals">
            <IonIcon icon={peopleCircleSharp} />
            <IonLabel>Browse</IonLabel>
          </IonTabButton>
        ) : (
            <IonTabButton tab="appointments" href="/app/appointments">
              <IonIcon icon={fileTrayFullSharp} />
              <IonLabel>Appointments</IonLabel>
            </IonTabButton>
          )
        }

        <IonTabButton tab="chat" href="/app/chat">
          <IonIcon icon={chatbubblesSharp} />
          <IonLabel>Chat</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Main;

function ChatRouter() {
  const { path } = useRouteMatch();
  return (
    <IonRouterOutlet>
      <Route path={path} component={Chat} exact />
      <Route path={`${path}/:threadId`} component={Thread} exact />
    </IonRouterOutlet>
  );
}

function ConditionsRouter() {
  const { path } = useRouteMatch();
  return (
    <IonRouterOutlet>
      <Route path={path} component={Conditions} exact />
      <Route path={`${path}/new`} component={NewCondition} exact />
      <Route path={`${path}/:conditionId/details`} component={Condition} exact />
    </IonRouterOutlet>
  );
}

function ProfessionalsRouter() {
  const { path } = useRouteMatch();
  return (
    <IonRouterOutlet>
      <Route path={path} component={Listing} exact />
      <Route path={`${path}/:professionalId/book`} component={BookAppointment} exact />
    </IonRouterOutlet>
  );
}