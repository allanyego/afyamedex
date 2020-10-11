import React from "react";
import { useRouteMatch, Route, Redirect } from "react-router";
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonRouterOutlet } from "@ionic/react";
import { informationCircle, personCircle, chatbubbles, fileTrayFull } from "ionicons/icons";
import InfoCenter from "./Conditions";
import Chat from "./Chat";
import Listing from "./Listing";
import Thread from "./Thread";
import Condition from "./Condition";
import Profile from "./Profile";
import BookAppointment from "./BookAppointment";
import NewCondition from "./NewCondition";
import Appointments from "./Appointments";
import { useAppContext } from "../lib/context-lib";
import { USER } from "../http/constants";

const Main: React.FC = () => {
  const { url, path } = useRouteMatch();
  const { currentUser } = useAppContext() as any;

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path={path} exact={true} render={() => <Redirect to={`${path}/info`} />} />
        <Route path={`${path}/info`} component={InfoCenter} />
        <Route path={`${path}/info/:conditionId`} component={Condition} exact />
        <Route path={`${path}/info/new`} component={NewCondition} exact />
        <Route path={`${path}/chat`} component={Chat} exact={true} />
        <Route path={`${path}/chat/:threadId`} component={Thread} exact />
        <Route path={`${path}/book/:professionalId`} component={BookAppointment} exact />
        <Route path={`${path}/professionals`} component={Listing} exact={true} />
        <Route path={`${path}/appointments`} component={Appointments} exact />
        <Route path={`${path}/profile/:userId?`} component={Profile} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="info" href={`${url}/info`}>
          <IonIcon icon={informationCircle} />
          <IonLabel>Info Center</IonLabel>
          <IonBadge>6</IonBadge>
        </IonTabButton>

        {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
          <IonTabButton tab="professionals" href={`${url}/professionals`}>
            <IonIcon icon={personCircle} />
            <IonLabel>Professionals</IonLabel>
          </IonTabButton>
        ) : (
            <IonTabButton tab="appointments" href={`${url}/appointments`}>
              <IonIcon icon={fileTrayFull} />
              <IonLabel>Appointments</IonLabel>
            </IonTabButton>
          )
        }

        <IonTabButton tab="chat" href={`${url}/chat`}>
          <IonIcon icon={chatbubbles} />
          <IonLabel>Chat</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Main;